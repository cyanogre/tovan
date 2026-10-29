'use strict';
/* ======================================================================
   FUSIONES DE FOIL (prefijo fus; sobre todos los foil)
   Solo se fusionan los foil que chocarían entre sí (FUS_RANURA): dos
   transformaciones o monturas (solo cabe una a la vez), dos que salen con
   el ataque especial o dos que se pelean por rodar. Los demás conviven.
   Si coges uno que choca con otro que ya tienes, los dos desaparecen y
   nace un poder nuevo: una mezcla de los dos TEMAS, no de los dos poderes.
   Uno pone el cuerpo (su objeto: la bola de pinchos, la moto, el dragón…)
   y el otro el alma (sus colores, su aura, su estela, su sonido y un
   adjetivo): «Moto jurásica», «Dragón supersónico»… El cuerpo lleva los
   colores del alma (la bola de pinchos, dorada). La forma de pegar
   (FUS_ARQ) sale al azar de las que le van a ese cuerpo, así que cambia
   de una partida a otra. Se lanza con lo que chocaba: el ataque especial,
   rodar dos veces o, si eran dos formas, sola cada 25 golpes (unos
   cuantos cuerpos pequeños giran alrededor de Tovan mientras se carga).
   Solo hay una fusión por partida: lo que chocaría con ella ya no sale.
   Nada de texto en partida; la carta sí lo cuenta.
   ====================================================================== */
const FUS_RANURA = {
  foilKyubi: ['forma', 'especial'], foilTitan: ['forma', 'especial'], foilMagica: ['forma'], foilMoto: ['forma', 'rodar'], foilEstrella: ['forma'], foilPacman: ['forma'],
  foilDino: ['forma'], foilDante: ['forma'], foilDominio: ['forma', 'especial'], foilKatamari: ['forma'], foilSmash: ['forma'], foilBahamut: ['especial'], foilSonic: ['rodar']
};
// cuerpo: [sustantivo, género, plural]; alma: [adjetivo masculino, femenino]; cols: los colores del alma; dibujo: el cuerpo pintado; cinta: el trazo de foil.js/foil-*.js
const FUS_TEMA = {
  foilKyubi:    { cuerpo: ['zorro de nueve colas', 'm', 'zorros de nueve colas'], alma: ['de chakra', 'de chakra'], cols: [0xff8a20, 0xffd060, 0xfff0c0], dibujo: 'colas', cinta: 'kyu', son: 'kyuRugido', arq: ['avatar', 'torbellino', 'invocacion'] },
  foilTitan:    { cuerpo: ['titán', 'm', 'titanes'], alma: ['colosal', 'colosal'], cols: [0xe07050, 0xf4c8a8, 0xffffff], dibujo: 'titan', cinta: 'fuego', son: 'titRayo', arq: ['invocacion', 'avatar'] },
  foilMagica:   { cuerpo: ['corazón', 'm', 'corazones'], alma: ['mágico', 'mágica'], cols: [0xff7ad8, 0xffd0f0, 0xfff6a0], dibujo: 'corazon', cinta: 'mag', son: 'magArpegio', arq: ['lluvia', 'rayo', 'avatar'] },
  foilMoto:     { cuerpo: ['moto', 'f', 'motos'], alma: ['turbo', 'turbo'], cols: [0xff2a3a, 0xffffff, 0xff8a3a], dibujo: 'rueda', cinta: 'mto', son: 'mtoArranque', arq: ['cometa', 'torbellino'] },
  foilEstrella: { cuerpo: ['estrella', 'f', 'estrellas'], alma: ['invencible', 'invencible'], cols: [0xffe23a, 0xff5ad8, 0x5ad8ff], dibujo: 'estrella', cinta: 'str', son: 'strEstrella', arq: ['lluvia', 'avatar', 'cometa'] },
  foilPacman:   { cuerpo: ['comecocos', 'm', 'comecocos'], alma: ['glotón', 'glotona'], cols: [0xffe000, 0x3a50ff, 0xff4a4a], dibujo: 'comecocos', cinta: 'mto', son: 'pacPoder', arq: ['torbellino', 'cometa'] },
  foilDino:     { cuerpo: ['dinosaurio', 'm', 'dinosaurios'], alma: ['jurásico', 'jurásica'], cols: [0x5ad85a, 0xffffff, 0xff5a4a], dibujo: 'huevo', cinta: 'tinta', son: 'yosGorjeo', arq: ['lluvia', 'invocacion'] },
  foilDante:    { cuerpo: ['demonio', 'm', 'demonios'], alma: ['demoníaco', 'demoníaca'], cols: [0xe0102a, 0x400818, 0xff8a3a], dibujo: 'demonio', cinta: 'dmc', son: 'dmcGatillo', arq: ['avatar', 'rayo'] },
  foilDominio:  { cuerpo: ['ojo del vacío', 'm', 'ojos del vacío'], alma: ['infinito', 'infinita'], cols: [0xa04aff, 0x3a7aff, 0xff3a6a], dibujo: 'ojo', cinta: 'vac', son: 'vacSello', arq: ['torbellino', 'rayo'] },
  foilKatamari: { cuerpo: ['bola', 'f', 'bolas'], alma: ['cósmico', 'cósmica'], cols: [0x9ae85a, 0xff8ac8, 0x5ad8ff], dibujo: 'bola', cinta: 'ktm', son: 'ktmEstrella', arq: ['cometa', 'torbellino', 'invocacion'] },
  foilSmash:    { cuerpo: ['bola Smash', 'f', 'bolas Smash'], alma: ['definitivo', 'definitiva'], cols: [0xfff4d0, 0xff5a5a, 0xffe060], dibujo: 'smash', cinta: 'rayo', son: 'smbRompe', arq: ['rayo', 'avatar', 'invocacion'] },
  foilBahamut:  { cuerpo: ['dragón', 'm', 'dragones'], alma: ['dracónico', 'dracónica'], cols: [0x4a6aff, 0xffd860, 0xffffff], dibujo: 'dragon', cinta: 'bah', son: 'bahRugido', arq: ['rayo', 'invocacion'] },
  foilSonic:    { cuerpo: ['bola de pinchos', 'f', 'bolas de pinchos'], alma: ['supersónico', 'supersónica'], cols: [0x2a6aff, 0xffd21e, 0xffffff], dibujo: 'pincho', cinta: 'snc', son: 'sncSale', arq: ['cometa', 'avatar'] }
};
const FUS_GOLPES = 25;
const FUS = { cfg: null, abs: new Set(), pend: [], mat: null, sprites: [], carga: 0, ult: -9, snap: null, aura: null, orbita: [] };

/* ---------- Los cuerpos, pintados en gris para teñirlos con el alma ---------- */
const FUS_DIBUJO = {
  pincho(g){ for (let i = 0; i < 12; i++){ const a = i / 12 * TAU; g.beginPath(); g.moveTo(32 + Math.cos(a - 0.22) * 16, 32 + Math.sin(a - 0.22) * 16); g.lineTo(32 + Math.cos(a) * 30, 32 + Math.sin(a) * 30); g.lineTo(32 + Math.cos(a + 0.22) * 16, 32 + Math.sin(a + 0.22) * 16); g.fill(); g.stroke(); }
    g.beginPath(); g.arc(32, 32, 17, 0, TAU); g.fill(); g.stroke(); },
  rueda(g){ g.beginPath(); g.arc(32, 32, 27, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#5a5a5a'; g.beginPath(); g.arc(32, 32, 19, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = '#e8e8e8'; for (let i = 0; i < 6; i++){ const a = i / 6 * TAU; g.beginPath(); g.moveTo(32, 32); g.lineTo(32 + Math.cos(a) * 18, 32 + Math.sin(a) * 18); g.stroke(); }
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(32, 32, 6, 0, TAU); g.fill(); },
  estrella(g){ g.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i / 10 * TAU, r = i % 2 ? 13 : 29; g.lineTo(32 + Math.cos(a) * r, 34 + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#202020'; g.fillRect(25, 28, 4, 9); g.fillRect(35, 28, 4, 9); },
  comecocos(g){ g.beginPath(); g.moveTo(32, 32); g.arc(32, 32, 27, 0.6, TAU - 0.6); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#202020'; g.beginPath(); g.arc(34, 18, 4, 0, TAU); g.fill(); },
  huevo(g){ g.beginPath(); g.ellipse(32, 34, 21, 27, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#8a8a8a'; for (const [x, y, r] of [[24, 26, 6], [40, 38, 7], [28, 46, 4], [42, 22, 4]]){ g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } },
  demonio(g){ g.beginPath(); g.moveTo(14, 26); g.lineTo(6, 4); g.lineTo(24, 18); g.lineTo(40, 18); g.lineTo(58, 4); g.lineTo(50, 26); g.lineTo(52, 44); g.lineTo(32, 60); g.lineTo(12, 44); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#202020'; g.beginPath(); g.moveTo(18, 32); g.lineTo(29, 36); g.lineTo(20, 40); g.fill(); g.beginPath(); g.moveTo(46, 32); g.lineTo(35, 36); g.lineTo(44, 40); g.fill(); g.fillRect(24, 48, 16, 3); },
  ojo(g){ g.beginPath(); g.moveTo(3, 32); g.quadraticCurveTo(32, 2, 61, 32); g.quadraticCurveTo(32, 62, 3, 32); g.fill(); g.stroke(); g.fillStyle = '#6a6a6a'; g.beginPath(); g.arc(32, 32, 13, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = '#101010'; g.beginPath(); g.arc(32, 32, 6, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(35, 25, 4, 4); },
  bola(g){ for (let i = 0; i < 9; i++){ const a = i / 9 * TAU; g.beginPath(); g.arc(32 + Math.cos(a) * 22, 32 + Math.sin(a) * 22, 7, 0, TAU); g.fill(); g.stroke(); } g.beginPath(); g.arc(32, 32, 22, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = '#9a9a9a'; g.beginPath(); g.arc(38, 38, 9, 0, TAU); g.fill(); },
  smash(g){ g.beginPath(); g.arc(32, 32, 28, 0, TAU); g.fill(); g.stroke(); g.lineWidth = 5; g.beginPath(); g.moveTo(32, 4); g.lineTo(32, 60); g.stroke(); g.beginPath(); g.arc(32, 72, 34, -2.4, -0.74); g.stroke(); },
  dragon(g){ g.beginPath(); g.moveTo(6, 30); g.lineTo(24, 14); g.lineTo(30, 2); g.lineTo(36, 14); g.lineTo(58, 22); g.lineTo(62, 34); g.lineTo(44, 36); g.lineTo(58, 46); g.lineTo(30, 52); g.lineTo(10, 44); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#202020'; g.beginPath(); g.arc(36, 24, 4, 0, TAU); g.fill(); },
  colas(g){ for (let i = 0; i < 9; i++){ const a = -2.6 + i / 8 * 2.1; g.beginPath(); g.ellipse(32 + Math.cos(a) * 16, 40 + Math.sin(a) * 16, 6, 16, a + Math.PI / 2, 0, TAU); g.fill(); g.stroke(); }
    g.beginPath(); g.arc(32, 44, 13, 0, TAU); g.fill(); g.stroke(); },
  titan(g){ g.beginPath(); g.ellipse(32, 30, 24, 27, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#202020'; g.fillRect(17, 22, 10, 6); g.fillRect(37, 22, 10, 6);
    g.fillStyle = '#ffffff'; g.fillRect(14, 40, 36, 12); g.strokeRect(14, 40, 36, 12); for (let i = 1; i < 6; i++){ g.beginPath(); g.moveTo(14 + i * 6, 40); g.lineTo(14 + i * 6, 52); g.stroke(); } },
  corazon(g){ g.beginPath(); g.moveTo(32, 56); g.bezierCurveTo(4, 36, 6, 8, 32, 20); g.bezierCurveTo(58, 8, 60, 36, 32, 56); g.fill(); g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(22, 22, 4, 0, TAU); g.fill(); }
};
const FUS_TEX = {};
function fusTex(dibujo){
  if (FUS_TEX[dibujo]) return FUS_TEX[dibujo];
  const t = new THREE.CanvasTexture(foilLienzo(64, 64, g => { g.lineWidth = 3.5; g.strokeStyle = '#1a1a1a'; g.fillStyle = '#ececec'; g.lineJoin = 'round'; FUS_DIBUJO[dibujo](g); }));
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return (FUS_TEX[dibujo] = t);
}
function fusSprite(){
  let s = FUS.sprites.find(q => !q.usada); if (!s){ s = { sp: new THREE.Sprite(FUS.mat) }; s.sp.renderOrder = 6; scene.add(s.sp); FUS.sprites.push(s); }
  s.usada = true; s.sp.material = FUS.mat; s.sp.visible = true; s.sp.scale.setScalar(1); s.sp.material.rotation = 0; return s;
}
const fusSuelta = s => { s.usada = false; s.sp.visible = false; };
function fusCinta(){ const C = FUS.cfg.alma, c = tintaCoge([0xffffff, C.cols[0], C.cols[1], 0], 0, TRAZO_FS[C.cinta] ? C.cinta : 'rayo'); c.mat.blending = THREE.AdditiveBlending; return c; }
const fusCol = k => FUS.cfg.alma.cols[k % FUS.cfg.alma.cols.length];
function fusBoom(p, R, dano, power){
  xtrArea(p, R, () => rdmg(dano), 6, null, power || 1.4);
  burst7(PA7, p.x, 0.8, p.z, 18, FUS.cfg.alma.cols, 6, 0.25, 0.6, 4, 1.5, 0, SH7.star, 3); ringFx(p.x, p.z, fusCol(0), 0.3, R + 0.8, 0.4); ringFx(p.x, p.z, fusCol(1), 0.2, R, 0.35, 0.3);
}

/* ---------- Las seis formas de pegar ---------- */
const FUS_ARQ = {
  // te conviertes en el cuerpo con el alma encima: aura, colores, cuerpos que orbitan y salen disparados a cada golpe
  avatar: { forma: true, nom: 'transformación', desc: 'te transformas 10 s: aura de su color, nadie te toca y unos cuantos {c} giran a tu alrededor y salen disparados a cada golpe; el remate los lanza todos a la redonda',
    empieza(){ return foilForma({ id: 'fusAvatar', col: '#' + new THREE.Color(fusCol(0)).getHexString(), dur: 10, intocable: true, velK: 1.4, danoK: 1.5, camK: 1.08, escala: 1.12,
      contacto: { r: 1.1, dmg: () => rdmg(22), cd: 0.4, knock: 6 },
      empieza(){ FUS.snap = HERO_MATS.map(m => [m.uniforms.uColor.value.getHex(), m.uniforms.uEmissive.value]); ssjConstruye(); const u = SSJ.aura.material.uniforms; FUS.aura = [u.uA.value.getHex(), u.uB.value.getHex()]; u.uA.value.setHex(fusCol(2)); u.uB.value.setHex(fusCol(0));
        FUS.orbita = Array.from({ length: 6 }, (_, i) => ({ s: fusSprite(), a: i / 6 * TAU, fuera: 0 })); flash('#' + new THREE.Color(fusCol(0)).getHexString(), 0.4); shake = Math.max(shake, 0.35); },
      tick(dt){ fusAvatarTick(dt); }, golpe(f){ fusAvatarTiro(f, false); }, remate(f){ fusAvatarTiro(f, true); }, fin(){ fusAvatarFin(); } }); } },
  // te haces una bola gigante del cuerpo y arrollas
  cometa: { forma: true, nom: 'cometa', desc: 'te haces {u} gigante durante 7 s: vas el doble de rápido, arrollas a todo lo que tocas dejando una estela de su color y atacar es un embiste',
    empieza(){ return foilForma({ id: 'fusCometa', col: '#ffffff', dur: 7, intocable: true, velK: 2.1, camK: 1.1,
      contacto: { r: 1.5, dmg: () => rdmg(36), cd: 0.3, knock: 10, al: e => { burst7(PA7, e.g.position.x, 1, e.g.position.z, 8, FUS.cfg.alma.cols, 5, 0.22, 0.4, 0, 1, 0, SH7.star, 2); play('sncGolpe'); } },
      empieza(){ this.s = fusSprite(); this.s.sp.scale.setScalar(2.4); this.cinta = fusCinta(); this.h = []; },
      tick(dt){ const H = hero.position; P.body.visible = false; this.s.sp.position.set(H.x, 1.1, H.z); this.s.sp.material.rotation -= dt * 12;
        const v = this.h.length >= 30 ? this.h.shift() : new V3(); this.h.push(v.set(H.x, 1.0, H.z)); if (this.h.length > 3) tintaPinta(this.cinta, mtoRuta(this.h), 0, 1, q => 1.1 * q);
        if (this.emb){ this.emb.t -= dt; const r = clampArena(xtrV.set(H.x + Math.sin(this.emb.f) * 18 * dt, 0, H.z + Math.cos(this.emb.f) * 18 * dt), ARENA - 0.4); H.x = r.x; H.z = r.z; if (this.emb.t <= 0) this.emb = null; } },
      ataque(){ if (this.emb) return; this.emb = { t: 0.35, f: inputMag > 0.12 ? inputHeading : hero.rotation.y }; play('ssjDestello'); },
      fin(){ fusSuelta(this.s); tintaSuelta(this.cinta); P.body.visible = true; } }); } },
  // cae del cielo un cuerpo gigante sobre el grupo más grande
  invocacion: { nom: 'invocación', desc: 'cae del cielo {u} gigante sobre el grupo más grande, revienta y rebota dos veces más',
    empieza(){ const e = xtrGrupo(hero.position, 16), p = e ? e.g.position.clone() : hero.position.clone().add(xtrV.set(Math.sin(heading) * 4, 0, Math.cos(heading) * 4)); p.y = 0;
      const s = fusSprite(), aviso = gring(p.x, 0.1, p.z, fusCol(0), 4.5, 0.6, 0.8); const cs_ = [fusCinta(), fusCinta(), fusCinta()];
      foilFx.push({ t: 0, cintas: cs_, upd(dt){ const t = this.t; let y;
          if (t < 0.75){ y = 30 - 26 * (t / 0.75) * (t / 0.75); s.sp.scale.setScalar(7); }
          else { if (!this.b0){ this.b0 = 1; fusBoom(p, 5, 80, 2); flash('#' + new THREE.Color(fusCol(0)).getHexString(), 0.35); shake = Math.max(shake, 0.9); hitStop = Math.max(hitStop, 0.08); play('titCrater'); }
            const k = t - 0.75, n = Math.floor(k / 0.55), q = (k % 0.55) / 0.55; y = Math.sin(q * Math.PI) * (n === 0 ? 3.5 : 1.8) + 3.2 * (1 - n * 0.3);
            if (n >= 1 && !this['b' + n] && n < 3){ this['b' + n] = 1; fusBoom(p, 3.5, 40); shake = Math.max(shake, 0.4); }
            s.sp.scale.setScalar(Math.max(0.01, 7 - k * 2)); if (n >= 3) return false; }
          s.sp.position.set(p.x, y + 3.2, p.z); s.sp.material.rotation = Math.sin(t * 4) * 0.2;
          cs_.forEach((c, i) => { const a = i / 3 * TAU + t * 3; tintaPinta(c, (q, v) => v.set(p.x + Math.sin(a + q * 2) * (1 + q * 3), y + 3 - q * 3, p.z + Math.cos(a + q * 2) * (1 + q * 3)), 0, 1, q => 0.5 * (1 - q)); });
          return true; }, fin(){ fusSuelta(s); } }); return true; } },
  // llueven cuerpos sobre los enemigos
  lluvia: { nom: 'lluvia', desc: 'llueven veinticuatro {c} sobre los enemigos y cada uno revienta al caer',
    empieza(){ const L = foilEnemigos(hero.position, 14), H = hero.position; play('wrmSilba');
      for (let i = 0; i < 24; i++){ const e = L.length ? L[i % L.length] : null, p = e ? e.g.position.clone().add(xtrV.set((Math.random() - 0.5) * 2.4, 0, (Math.random() - 0.5) * 2.4)) : H.clone().add(xtrV.set((Math.random() - 0.5) * 9, 0, (Math.random() - 0.5) * 9));
        const s = fusSprite(), t0 = i * 0.11, ver = { a: false };
        foilFx.push({ t: 0, upd(){ const t = this.t - t0; if (t < 0){ s.sp.visible = false; return true; } s.sp.visible = true; const k = Math.min(1, t / 0.45); s.sp.position.set(p.x, 0.6 + 14 * (1 - k * k), p.z); s.sp.scale.setScalar(1.3); s.sp.material.rotation = t * 6;
            if (Math.random() < 0.6) pa(p.x, s.sp.position.y + 0.6, p.z, 0, 2, 0, fusCol(i), 0.14, 0.3, 0, 0, 0, SH7.dot);
            if (k >= 1){ fusBoom(p, 1.6, 28); shake = Math.max(shake, 0.15); if (i % 4 === 0) play('ktmBonk'); return false; } return true; }, fin(){ fusSuelta(s); } }); }
      return true; } },
  // un rayo enorme hacia delante, con cuerpos que corren por dentro
  rayo: { nom: 'rayo', desc: 'disparas un rayo enorme hacia delante durante 2 s, con {c} que corren por dentro, que quema todo lo que pilla',
    empieza(){ const cs_ = [fusCinta(), fusCinta(), fusCinta()], ss = Array.from({ length: 6 }, () => fusSprite()); play('bahRayo');
      foilFx.push({ t: 0, cintas: cs_, tic: 0, upd(dt){ const t = this.t, H = hero.position, f = hero.rotation.y, fx = Math.sin(f), fz = Math.cos(f), L = 14 * Math.min(1, t / 0.2), fade = t > 1.8 ? (t - 1.8) / 0.3 : 0; if (fade >= 1) return false;
          cs_.forEach((c, i) => { tintaPinta(c, (q, v) => { const w = Math.sin(q * 20 - t * 30 + i * 2) * 0.25 * (i ? 1 : 0); return v.set(H.x + fx * (0.8 + q * L) + fz * w, 1.1 + Math.cos(q * 17 + t * 25 + i) * 0.2 * (i ? 1 : 0), H.z + fz * (0.8 + q * L) - fx * w); }, 0, 1, q => (i ? 0.7 : 1.4) * (1 - fade) * (0.6 + 0.4 * Math.sin(q * 30 + t * 40))); c.mat.uniforms.uAlpha.value = 1 - fade; });
          ss.forEach((s, i) => { const q = ((t * 1.3 + i / 6) % 1); s.sp.position.set(H.x + fx * (0.8 + q * L), 1.1, H.z + fz * (0.8 + q * L)); s.sp.scale.setScalar(1.1 * (1 - fade)); s.sp.material.rotation = t * 8; });
          shake = Math.max(shake, 0.18 * (1 - fade)); if ((this.tic -= dt) <= 0 && fade === 0){ this.tic = 0.18;
            for (const e of foilEnemigos(H, L + 1)){ const dx = e.g.position.x - H.x, dz = e.g.position.z - H.z, a = dx * fx + dz * fz, lat = Math.abs(dx * fz - dz * fx); if (a < 0 || a > L || lat > 1.6 + e.r) continue; foilGolpea(e, rdmg(16), fx, fz, 2, null, 1); } }
          return true; }, fin(){ ss.forEach(fusSuelta); } }); return true; } },
  // un torbellino que lo arrastra todo hacia dentro y revienta
  torbellino: { nom: 'torbellino', desc: 'abres un torbellino de {c} que arrastra a los enemigos hacia dentro 3 s y revienta',
    empieza(){ const e = xtrGrupo(hero.position, 14), p = e ? e.g.position.clone() : hero.position.clone().add(xtrV.set(Math.sin(heading) * 4, 0, Math.cos(heading) * 4)); p.y = 0;
      const cs_ = [fusCinta(), fusCinta(), fusCinta()], ss = Array.from({ length: 8 }, () => fusSprite()); play('vacAbre');
      foilFx.push({ t: 0, cintas: cs_, tic: 0, upd(dt){ const t = this.t, k = Math.min(1, t / 0.4);
          cs_.forEach((c, i) => { tintaPinta(c, (q, v) => { const a = q * TAU * 2.5 - t * 9 + i / 3 * TAU, r = (0.3 + q * 3.6) * k; return v.set(p.x + Math.sin(a) * r, 0.3 + q * 2.4, p.z + Math.cos(a) * r); }, 0, 1, q => 0.35 + q * 0.4); });
          ss.forEach((s, i) => { const a = i / 8 * TAU - t * 6, r = 3.6 * (1 - ((t * 0.7 + i / 8) % 1)); s.sp.position.set(p.x + Math.sin(a) * r, 0.9 + r * 0.4, p.z + Math.cos(a) * r); s.sp.scale.setScalar(0.9); s.sp.material.rotation = t * 10; });
          if (dt > 0) for (const q of foilEnemigos(p, 6)){ if (strFuerte(q)) continue; const dx = p.x - q.g.position.x, dz = p.z - q.g.position.z, d = Math.hypot(dx, dz); if (d > 0.4){ q.g.position.x += dx / d * Math.min(d, 6 * dt); q.g.position.z += dz / d * Math.min(d, 6 * dt); } }
          if ((this.tic -= dt) <= 0){ this.tic = 0.25; for (const q of foilEnemigos(p, 3.6)) foilGolpea(q, rdmg(9), 0, 0, 0, null, 0.6); }
          if (t >= 3){ fusBoom(p, 4.5, 70, 2); flash('#' + new THREE.Color(fusCol(0)).getHexString(), 0.3); shake = Math.max(shake, 0.6); play('vacPurpura'); return false; } return true; },
        fin(){ ss.forEach(fusSuelta); } }); return true; } }
};
function fusAvatarTick(dt){
  const O = hero.position, F = FOILX.forma; if (!F) return;
  HERO_MATS.forEach((m, i) => { const o = FUS.snap && FUS.snap[i]; if (!o) return; m.uniforms.uColor.value.copy(strCol1.setHex(o[0]).lerp(strCol2.setHex(fusCol(i)), 0.45)); m.uniforms.uEmissive.value = Math.max(o[1], 0.4 + 0.15 * Math.sin(time * 12)); });
  const A = SSJ.aura; A.visible = !cs.active; A.position.set(O.x, O.y, O.z); A.scale.set(0.95, 0.85 + 0.06 * Math.sin(time * 17), 0.95); A.material.uniforms.uTime.value = time; A.material.uniforms.uAlpha.value = 0.55;
  for (const q of FUS.orbita){ const s = q.s.sp; if (q.fuera > 0){ q.fuera -= dt; continue; } s.visible = true; q.a += dt * 2.4; s.position.set(O.x + Math.sin(q.a) * 1.3, 1.2 + Math.sin(q.a * 2) * 0.3, O.z + Math.cos(q.a) * 1.3); s.scale.setScalar(0.65); s.material.rotation = q.a; }
  if (Math.random() < dt * 25) pa(O.x + (Math.random() - 0.5) * 0.9, O.y + 0.2 + Math.random() * 1.5, O.z + (Math.random() - 0.5) * 0.9, 0, 1.5 + Math.random() * 1.5, 0, fusCol(Math.floor(Math.random() * 3)), 0.2, 0.5, -0.5, 1, 0.2, SH7.star);
}
function fusAvatarTiro(f, todos){
  const O = hero.position, L = foilEnemigos(O, todos ? 6 : 8); if (!L.length && !todos) return;
  for (const q of FUS.orbita){ if (q.fuera > 0) continue; const e = todos ? null : L[Math.floor(Math.random() * L.length)], de = q.s.sp.position.clone(), s = fusSprite(), a = q.a, c = fusCinta(); q.fuera = 0.6; q.s.sp.visible = false;
    foilFx.push({ t: 0, cintas: [c], h: [de.clone()], upd(){ const k = Math.min(1, this.t / 0.22), to = e && e.alive ? e.g.position : xtrV.set(O.x + Math.sin(a) * 6, 0, O.z + Math.cos(a) * 6);
        s.sp.position.set(lerp(de.x, to.x, k), lerp(de.y, 1, k) + Math.sin(k * Math.PI) * 0.6, lerp(de.z, to.z, k)); s.sp.scale.setScalar(0.8); this.h.push(s.sp.position.clone()); if (this.h.length > 12) this.h.shift();
        if (this.h.length > 2) tintaPinta(c, mtoRuta(this.h), 0, 1, q2 => 0.25 * q2);
        if (k >= 1){ if (e) { const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(30), dx / l, dz / l, 4, null, 1.2); } else fusBoom(s.sp.position.clone().setY(0), 2.2, 40);
          burst7(PA7, s.sp.position.x, 1, s.sp.position.z, 8, FUS.cfg.alma.cols, 5, 0.2, 0.4, 0, 1, 0, SH7.star, 2); return false; } return true; }, fin(){ fusSuelta(s); } });
    if (!todos) break; }
  if (todos){ ringFx(O.x, O.z, fusCol(0), 0.4, 6, 0.4); play(FUS.cfg.alma.son); }
}
function fusAvatarFin(){
  if (FUS.snap){ HERO_MATS.forEach((m, i) => { m.uniforms.uColor.value.setHex(FUS.snap[i][0]); m.uniforms.uEmissive.value = FUS.snap[i][1]; }); FUS.snap = null; }
  if (SSJ.aura){ SSJ.aura.visible = false; if (FUS.aura){ const u = SSJ.aura.material.uniforms; u.uA.value.setHex(FUS.aura[0]); u.uB.value.setHex(FUS.aura[1]); FUS.aura = null; } }
  for (const q of FUS.orbita) fusSuelta(q.s); FUS.orbita = [];
}

/* ---------- Lanzarla ---------- */
function fusLanza(){
  const C = FUS.cfg; if (!C || !foilPuede() || !foilEscenario()) return false;
  const A = FUS_ARQ[C.arq]; if (A.forma && FOILX.forma) return false;
  const ok = A.empieza(); if (!ok) return false;
  play(C.alma.son); play('fusSale'); return true;
}
// con dos formas: se carga sola a golpes; unos cuantos cuerpos pequeños giran alrededor mientras tanto
function fusCargaTick(dt){
  const C = FUS.cfg, n = Math.min(5, Math.floor(FUS.carga / (FUS_GOLPES / 5))), O = hero.position;
  while (FUS.orbCarga.length < n) FUS.orbCarga.push(fusSprite()); while (FUS.orbCarga.length > n) fusSuelta(FUS.orbCarga.pop());
  FUS.orbCarga.forEach((s, i) => { const a = time * 2 + i / 5 * TAU; s.sp.visible = !FOILX.forma && gameState === 'play' && !cs.active; s.sp.position.set(O.x + Math.sin(a) * 0.9, 2.1 + Math.sin(time * 3 + i) * 0.1, O.z + Math.cos(a) * 0.9); s.sp.scale.setScalar(0.32); });
  if (FUS.carga >= FUS_GOLPES && fusLanza()){ FUS.carga = 0; }
}

/* ---------- La fusión ---------- */
const fusChocan = (a, b) => (FUS_RANURA[a] || []).some(r => (FUS_RANURA[b] || []).includes(r));
const fusTenidos = () => Object.keys(FUS_RANURA).filter(id => lvl(id));
function fusFunde(a, b){
  for (const d of FOILP) if ((d.id === a || d.id === b) && d.limpia){ try { d.limpia('mutacion'); } catch (err) { console.error(err); } }
  if (FOILX.forma) foilFormaAcaba('fusion');
  delete taken[a]; delete taken[b]; FUS.abs.add(a); FUS.abs.add(b);
  const [ci, ai] = Math.random() < 0.5 ? [a, b] : [b, a], cuerpo = FUS_TEMA[ci], alma = FUS_TEMA[ai], arqs = cuerpo.arq, arq = arqs[Math.floor(Math.random() * arqs.length)];
  const ranuras = [...new Set([...FUS_RANURA[a], ...FUS_RANURA[b]])], disparo = ranuras.includes('especial') ? 'especial' : ranuras.includes('rodar') ? 'rodar' : 'golpes';
  const nombre = cuerpo.cuerpo[0][0].toUpperCase() + cuerpo.cuerpo[0].slice(1) + ' ' + alma.alma[cuerpo.cuerpo[1] === 'f' ? 1 : 0];
  FUS.cfg = { a, b, cuerpo, alma, arq, ranuras, disparo, nombre, ic: (UPGRADES.find(x => x.id === ci) || {}).ic || '⚗️' };
  FUS.mat = new THREE.SpriteMaterial({ map: fusTex(cuerpo.dibujo), color: new THREE.Color(alma.cols[0]).lerp(new THREE.Color(0xffffff), 0.25), transparent: true, depthWrite: false });
  FUS.carga = 0;
  const U = UPGRADES.find(x => x.id === 'foilFusion'), na = (UPGRADES.find(x => x.id === a) || {}).name, nb = (UPGRADES.find(x => x.id === b) || {}).name, D = FUS_ARQ[arq];
  const plural = cuerpo.cuerpo[2];
  const cuando = disparo === 'especial' ? 'Con el ataque especial' : disparo === 'rodar' ? 'Rodando dos veces seguidas' : `Sola, cada ${FUS_GOLPES} golpes`;
  Object.assign(U, { name: nombre, ic: FUS.cfg.ic, desc: `Fusión de «${na}» y «${nb}». ${cuando}, ${D.desc.replace('{c}', plural).replace('{u}', (cuerpo.cuerpo[1] === 'f' ? 'una ' : 'un ') + cuerpo.cuerpo[0])}.` });
  taken.foilFusion = 1; try { recountTags(); } catch (e) {}
  FUS.pend.push(FUS.cfg);
}
function fusVigila(){
  if (!FUS.cfg){ const L = fusTenidos(); for (let i = 0; i < L.length && !FUS.cfg; i++) for (let j = i + 1; j < L.length; j++) if (fusChocan(L[i], L[j])){ fusFunde(L[i], L[j]); break; } }
  if (FUS.pend.length && gameState === 'play' && !player.dead && !cs.active) fusDestello(FUS.pend.shift());
}
// la fusión, sin rótulos: dos espirales de los colores de los dos temas suben alrededor de Tovan, se juntan y estallan
function fusDestello(C){
  const cols = [C.cuerpo.cols[0], C.alma.cols[0]], c = cols.map(k => tintaCoge([0xffffff, k, 0xffffff, 0], 0, 'rayo')); play('fusFunde');
  foilFx.push({ t: 0, cintas: c, upd(){ const t = this.t, k = Math.min(1, t / 0.8), O = hero.position;
      c.forEach((C_, i) => { tintaPinta(C_, (s, v) => { const a = s * TAU * 2.2 + i * Math.PI + t * 6, r = 1.3 * (1 - s * 0.85); return v.set(O.x + Math.sin(a) * r, 0.1 + s * 2.6, O.z + Math.cos(a) * r); }, Math.max(0, k - 0.6), k, q => 0.25 + 0.2 * q); C_.mat.uniforms.uAlpha.value = t < 0.85 ? 1 : Math.max(0, 1 - (t - 0.85) / 0.3); });
      if (!this.boom && t >= 0.8){ this.boom = true; flash('#ffffff', 0.35); shake = Math.max(shake, 0.3); burst7(PA7, O.x, 2.6, O.z, 40, [cols[0], cols[1], 0xffffff], 6, 0.18, 0.7, 2, 1.2, 0, SH7.star); ringFx(O.x, O.z, cols[0], 0.3, 3.5, 0.4); ringFx(O.x, O.z, cols[1], 0.2, 2.6, 0.35, 0.3);
        const s = fusSprite(); s.sp.position.set(O.x, 2.6, O.z); this.s = s; }
      if (this.s){ const q = (t - 0.8) / 0.5; this.s.sp.scale.setScalar(1.6 * Math.sin(Math.min(1, q) * Math.PI)); this.s.sp.position.set(O.x, 2.6 + q * 0.5, O.z); }
      return t < 1.3; }, fin(){ if (this.s) fusSuelta(this.s); } });
}
Object.assign(SFX, {
  fusFunde: () => { [60, 64, 67, 71, 74, 79].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.5, vol: 0.05, when: i * 0.1, rv: 0.8 })); noise({ dur: 0.9, vol: 0.12, f0: 500, f1: 5000, type: 'bandpass', attack: 0.6, rv: 0.6 }); tone({ type: 'sine', f0: 110, f1: 40, dur: 0.6, vol: 0.4, when: 0.8, rv: 0.6 }); },
  fusSale: () => { noise({ dur: 0.5, vol: 0.2, f0: 300, f1: 3000, type: 'bandpass', q: 1.5, rv: 0.3 }); tone({ type: 'sawtooth', f0: 110, f1: 330, dur: 0.35, vol: 0.06, rv: 0.3 }); }
});

/* ---------- La carta (una sola: la rellena la fusión) y el reparto ---------- */
foilPoder({ id: 'foilFusion', ic: '⚗️', name: 'Fusión', tags: ['otaku'], desc: 'Nace de dos foil que chocaban.',
  especial(){ return FUS.cfg && FUS.cfg.disparo === 'especial' ? fusLanza() : false; },
  rodar(){ if (!FUS.cfg || FUS.cfg.disparo !== 'rodar') return false; const antes = FUS.ult; FUS.ult = time; if (antes < 0 || time - antes > 0.5) return false; FUS.ult = -9; return fusLanza(); },
  dano(e, val, o, crit, melee){ if (FUS.cfg && FUS.cfg.disparo === 'golpes' && melee && gameState === 'play' && e.alive && !FOILX.forma) FUS.carga++; return val; },
  tick(dt, jugando){ if (FUS.cfg && FUS.cfg.disparo === 'golpes' && jugando && dt > 0) fusCargaTick(dt); else if (FUS.orbCarga.length) for (const s of FUS.orbCarga) s.sp.visible = false; },
  limpia(){ fusAvatarFin(); for (const s of FUS.sprites) fusSuelta(s); FUS.orbCarga = []; } });
FUS.orbCarga = [];
UPGRADES.find(x => x.id === 'foilFusion').req = () => false;   // nunca sale en el reparto: nace de dos foil
// lo que chocaría con la fusión (o con dos que ya tienes) ya no sale; en la carta se avisa de con quién se fusionaría
for (const id of Object.keys(FUS_RANURA)){ const U = UPGRADES.find(x => x.id === id); if (!U) continue; const r0 = U.req; U.descFus = U.desc;
  U.req = () => (!r0 || r0()) && !FUS.abs.has(id) && !(FUS.cfg && FUS.cfg.ranuras.some(r => FUS_RANURA[id].includes(r))) && fusTenidos().filter(o => o !== id && fusChocan(o, id)).length <= 1; }
const fus_dealCards = dealCards;
dealCards = function(...a){
  for (const id of Object.keys(FUS_RANURA)){ const U = UPGRADES.find(x => x.id === id); if (!U) continue; const o = fusTenidos().find(q => q !== id && fusChocan(q, id));
    U.desc = U.descFus + (o ? ` ⚗️ Choca con «${(UPGRADES.find(x => x.id === o) || {}).name}»: si la coges, las dos se fusionan en un poder nuevo.` : ''); }
  return fus_dealCards(...a);
};
const fus_v3Update = v3Update;
v3Update = function(dt, pdt, playing){ fus_v3Update(dt, pdt, playing); try { fusVigila(); } catch (err) { console.error(err); } };
const fus_startRun = startRun;
startRun = function(){ FUS.cfg = null; FUS.abs.clear(); FUS.pend.length = 0; FUS.carga = 0; Object.assign(UPGRADES.find(x => x.id === 'foilFusion'), { name: 'Fusión', ic: '⚗️', desc: 'Nace de dos foil que chocaban.' }); fus_startRun(); };

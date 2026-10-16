'use strict';
/* ======================================================================
   ANIME v6: veinte poderes «inspirados» en series de toda la vida,
   la Linterna vampírica que por fin se ve, y un juego más duro si no
   has desbloqueado cosas
   ====================================================================== */
const P6 = { capT: 8, allies: [], balls: [], kamT: 6, cardT: 8, cardCritT: 0, cardJump: false, milk: false, dogT: 6, dogs: [], frogT: 5, frogs: [], bots: [], tiaraT: 4, tiaras: [],
  soots: [], gadget: null, gadgetJ: 0, doorUsed: false, janN: 0, janReady: false, alchCd: 0, titanSet: new Set(), bankaiT: 0, atReady: true, atT: 0, hexes: [],
  ls: 0, lsBudget: 0, lsAcc: 0, lsShowT: 0, lsGlow: 0, culCd: 0, waterBusy: false, toyaCd: 0 };
UPGRADES.push(
  { id: 'capture', r: 'rara', tags: ['otaku'], ic: '🔴', name: '¡Te elijo a ti!', desc: 'Cada 16 s lanzas una bola de captura al enemigo más debilitado (no jefes). Lo capturas y pelea a tu lado 12 s.', max: 1, apply: () => { P6.capT = 2; } },
  { id: 'culito', r: 'rara', tags: ['otaku'], ic: '🍑', name: 'Baile del culito', desc: 'Cuando esquivas un golpe rodando, meneas el culo con descaro: los de alrededor se quedan pasmados y reciben un 25 % más de daño 3 s.', max: 1, apply: () => {} },
  { id: 'kamen', r: 'rara', tags: ['otaku', 'rayo'], ic: '🦸', name: 'Rayo del Ultrahéroe', desc: 'Cada 9 s haces la pose y disparas un rayo en línea recta. ¡Ja, ja, ja!', max: 2, apply: () => { P6.kamT = 1.5; } },
  { id: 'cards', r: 'epica', tags: ['otaku'], ic: '🃏', name: 'Cartas de Clou', desc: 'Cada 11 s se activa una carta mágica al azar: Fuego, Agua, Viento, Escudo, Salto, Espada, Flor o Tiempo.', max: 1, apply: () => { P6.cardT = 2; } },
  { id: 'toya', r: 'rara', tags: ['otaku'], ic: '🪵', name: 'Espada del lago Toya', desc: 'Una espada de madera comprada en la teletienda: el 12 % de tus golpes repiten con un 150 % de daño.', max: 1, apply: () => {} },
  { id: 'strawberry', r: 'comun', tags: ['otaku'], ic: '🍓', name: 'Leche de fresa', desc: 'Empiezas cada oleada con +20 % de daño. Lo pierdes en cuanto te dan.', max: 1, apply: () => { P6.milk = true; } },
  { id: 'bigdog', r: 'epica', tags: ['otaku'], ic: '🐕', name: 'Perro gigante', desc: 'Cada 10 s un perro blanco enorme sale del suelo y se come (casi) al enemigo más duro.', max: 1, apply: () => { P6.dogT = 2; } },
  { id: 'frogs', r: 'rara', tags: ['otaku'], ic: '🐸', name: 'Invasión rana', desc: 'Cada 10 s llegan tres ranitas soldado que saltan hacia los enemigos y los atrapan con la lengua.', max: 2, apply: () => { P6.frogT = 1.5; } },
  { id: 'gunpla', r: 'rara', tags: ['otaku', 'rayo'], ic: '🤖', name: 'Maqueta de robot', desc: 'Al empezar cada oleada montas una maqueta de robot que dispara a los enemigos cercanos durante 18 s.', max: 2, apply: () => { spawnBot(); } },
  { id: 'gomu', r: 'rara', tags: ['otaku', 'impacto'], ic: '🫲', name: 'Brazos de goma', desc: 'Tus brazos se estiran: +30 % de alcance y los remates empujan el doble.', max: 1, apply: () => {} },
  { id: 'bankai', r: 'epica', tags: ['otaku'], ic: '⚔️', name: '¡BAN-KAI!', desc: 'Al usar el especial, tu arma se vuelve enorme y negra 8 s: +50 % de daño y +30 % de alcance.', max: 1, apply: () => {} },
  { id: 'atfield', r: 'epica', tags: ['otaku', 'cristal'], ic: '🛑', name: 'Campo AT', desc: 'Un escudo hexagonal anula por completo un golpe. Tarda 9 s en volver a cargarse.', max: 1, apply: () => { P6.atReady = true; } },
  { id: 'waterBreath', r: 'rara', tags: ['otaku', 'hielo'], ic: '🌊', name: 'Respiración del agua', desc: 'Cada cuarto golpe sale una ola que corta, empuja y enfría. Primera postura.', max: 2, apply: () => {} },
  { id: 'tiara', r: 'rara', tags: ['otaku', 'cristal'], ic: '👑', name: 'Tiara lunar', desc: 'Cada 6 s lanzas una tiara brillante que va y vuelve atravesando enemigos. En el nombre de la Luna.', max: 2, apply: () => { P6.tiaraT = 1; } },
  { id: 'soot', r: 'comun', tags: ['otaku', 'fuego'], ic: '⚫', name: 'Bolitas de hollín', desc: 'Los enemigos que derrotas sueltan bolitas de hollín que se pegan a otros: los queman y los frenan.', max: 2, apply: () => {} },
  { id: 'pocket', r: 'epica', tags: ['otaku'], ic: '👝', name: 'Bolsillo mágico', desc: 'Al empezar cada oleada sacas un cachivache al azar: gorrocóptero, linterna encogedora, guante de fuerza o puerta a cualquier parte.', max: 1, apply: () => { pickGadget(); } },
  { id: 'jan', r: 'rara', tags: ['otaku', 'impacto'], ic: '✊', name: '¡Piedra, papel, tijera!', desc: 'Cada 12 golpes cargas el puño: el siguiente golpe es «¡PIEDRA!», hace el triple y explota.', max: 1, apply: () => {} },
  { id: 'diamond', r: 'rara', tags: ['otaku', 'hielo'], ic: '💠', name: 'Polvo de diamantes', desc: 'Tu especial suelta una ventisca de diamantes que congela a todo lo que hay a 5 m.', max: 1, apply: () => {} },
  { id: 'alchemy', r: 'rara', tags: ['otaku', 'impacto'], ic: '👏', name: 'Alquimia de palmada', desc: 'Al aterrizar de un salto das una palmada y brotan pinchos de piedra en cruz.', max: 1, apply: () => {} },
  { id: 'titan', r: 'comun', tags: ['otaku'], ic: '🗡️', name: 'Corte de nuca', desc: 'Ruedas un 15 % más lejos y cortas a todo lo que atraviesas rodando (30 % de crítico).', max: 1, apply: () => {} }
);
for (const u of UPGRADES) if (!u.ic) u.ic = '✦';
// la Linterna vampírica: menos números, mucho más visible
{ const u = UPGRADES.find(x => x.id === 'life');
  if (u){ u.desc = 'Cada golpe te roba 1,5 PV por nivel: la sangre vuela hasta tu linterna. Máximo, un 6 % de tu vida por segundo.'; u.apply = () => { P6.ls += 1.5; }; } }
[
  ['strawberry', () => (meta.runs || 0) >= 1, 'Juega 1 partida.', () => [meta.runs || 0, 1]],
  ['titan', ...R('rolls', 150, 'Rueda 150 veces.')],
  ['soot', () => (meta.kills || 0) >= 250, 'Derrota a 250 enemigos en total.', () => [meta.kills || 0, 250]],
  ['gomu', () => (meta.best || 0) >= 5, 'Llega a la oleada 5.', () => [meta.best || 0, 5]],
  ['toya', ...R('crits', 250, 'Asesta 250 críticos.')],
  ['kamen', ...R('specials', 8, 'Usa el especial 8 veces.')],
  ['culito', ...R('dodges', 35, 'Esquiva 35 golpes rodando.')],
  ['frogs', ...R('k_kasa', 25, 'Derrota a 25 kasa-obake.')],
  ['capture', () => Object.keys(meta.stats || {}).filter(k => k.startsWith('k_') && meta.stats[k] > 0).length >= 10, 'Derrota a 10 tipos de enemigo distintos.',
    () => [Object.keys(meta.stats || {}).filter(k => k.startsWith('k_') && meta.stats[k] > 0).length, 10]],
  ['tiara', () => beat('dragon'), 'Derrota a Ryūjin.'],
  ['waterBreath', ...R('wavesClr', 40, 'Supera 40 oleadas en total.')],
  ['jan', () => (meta.bestCombo || 0) >= 150, 'Haz un combo de 150.', () => [meta.bestCombo || 0, 150]],
  ['alchemy', ...R('jumps', 200, 'Salta 200 veces.')],
  ['diamond', ...R('frozen', 220, 'Congela a 220 enemigos.')],
  ['gunpla', ...R('k_drone', 15, 'Derrota a 15 drones del Canal X.')],
  ['cards', () => Object.keys(meta.syn || {}).length >= 12, 'Descubre 12 sinergias.', () => [Object.keys(meta.syn || {}).length, 12]],
  ['bigdog', () => beat('skeleton') && beat('teapot'), 'Derrota a Gashadokuro y a la Tetera de Utah.'],
  ['bankai', () => beat('sixeyes'), 'Derrota al de los Seis Ojos.'],
  ['atfield', () => beat('error'), 'Derrota a ERROR 404.'],
  ['pocket', () => Object.keys(meta.endings || {}).length >= 2, 'Consigue 2 finales distintos.', () => [Object.keys(meta.endings || {}).length, 2]]
].forEach(([id, c, t, p]) => pwRule(id, c, t, p));

/* ---------- Modelos ---------- */
const A6 = { ally: makeMat(0x8fd8ff, { emissive: 0.7, opacity: 0.78 }), ballA: makeMat(0x3ab86a), ballB: makeMat(0xffd23a), ballK: makeMat(0x1a1a22), frog: makeMat(0x5ac84a), frogB: makeMat(0xd8f0a0),
  eyeW: makeMat(0xffffff), eyeK: makeMat(0x101010), tongue: makeMat(0xff6a8a, { emissive: 0.3 }), dog: makeMat(0xf6f2ea), dogIn: makeMat(0xffb0b0), dogM: makeMat(0x5a1018), gold: makeMat(0xffd84a, { emissive: 0.6 }),
  gem: makeMat(0xff3a5a, { emissive: 0.8 }), hex: makeMat(0xff9a2a, { emissive: 1, opacity: 0.55, side: THREE.DoubleSide }), soot: makeMat(0x16141a), beam: makeMat(0xffe86a, { emissive: 1, opacity: 0.85 }),
  rW: makeMat(0xf0f0f4), rB: makeMat(0x2a5ad8), rR: makeMat(0xd8302a), rY: makeMat(0xffd23a, { emissive: 0.5 }), rG: makeMat(0x6a6a78), blood: 0xff2a4a };
const cardTex = texAsset('objetos/carta');
const cardMat = makeMat(0xffffff, { map: cardTex, emissive: 0.6, side: THREE.DoubleSide });
function mkBall(){ const g = new THREE.Group(); scene.add(g);
  mesh(new THREE.SphereGeometry(0.17, 10, 5, 0, TAU, 0, Math.PI / 2), A6.ballA, 0, 0, 0, g); mesh(new THREE.SphereGeometry(0.17, 10, 5, 0, TAU, Math.PI / 2, Math.PI / 2), A6.ballB, 0, 0, 0, g);
  const band = mesh(new THREE.TorusGeometry(0.17, 0.02, 4, 14), A6.ballK, 0, 0, 0, g); band.rotation.x = Math.PI / 2; mesh(new THREE.OctahedronGeometry(0.05, 0), A6.eyeW, 0, 0, 0.17, g); return g; }
// Ranas soldado al estilo Keroro: cabezota verde con la mitad de abajo blanca, gorro amarillo con orejeras
// y estrella roja, estrella amarilla (con borde rojo) en la barriga y ojazos. Cuerpecito de pie, bracitos y pies.
const frogStarGeo = (() => { const sh = new THREE.Shape(); for (let k = 0; k < 10; k++){ const a = Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 0.42 : 1; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (k) sh.lineTo(x, y); else sh.moveTo(x, y); } sh.closePath(); return new THREE.ShapeGeometry(sh); })();
const A6K = { verde: makeMat(0x4fb83a), blanco: makeMat(0xf4f6ea), gorro: makeMat(0xf0d24a), estrellaR: makeMat(0xe0262a, { side: THREE.DoubleSide }), estrellaA: makeMat(0xffd83a, { emissive: 0.25, side: THREE.DoubleSide }),
  ojo: makeMat(0xffffff), pupila: makeMat(0x101014), boca: makeMat(0x1a2a14) };
function mkFrog(){ const g = new THREE.Group(); scene.add(g);
  const ico = (r, m, x, y, z, sx, sy, sz) => { const o = mesh(new THREE.IcosahedronGeometry(r, 1), m, x, y, z, g); o.scale.set(sx || 1, sy || 1, sz || 1); return o; };
  // cuerpo de pie, barriga blanca con la estrella
  ico(0.12, A6K.verde, 0, 0.15, 0, 1, 1.1, 0.9); ico(0.1, A6K.blanco, 0, 0.14, 0.04, 0.95, 1, 0.75);
  const er = mesh(frogStarGeo, A6K.estrellaR, 0, 0.15, 0.118, g); er.scale.setScalar(0.075); const ea = mesh(frogStarGeo, A6K.estrellaA, 0, 0.15, 0.121, g); ea.scale.setScalar(0.058);
  for (const s of [-1, 1]){ ico(0.045, A6K.verde, 0.13 * s, 0.17, 0.02, 0.8, 1.3, 0.8); ico(0.05, A6K.verde, 0.06 * s, 0.02, 0.03, 1.1, 0.5, 1.5); }   // bracitos y pies
  // cabezota: verde arriba, blanca abajo; ojos grandes delante y boca ancha
  ico(0.2, A6K.verde, 0, 0.4, 0, 1.15, 0.92, 1); ico(0.185, A6K.blanco, 0, 0.36, 0.02, 1.12, 0.62, 0.98);
  for (const s of [-1, 1]){ ico(0.075, A6K.ojo, 0.09 * s, 0.44, 0.15, 0.9, 1.1, 0.5); ico(0.03, A6K.pupila, 0.085 * s, 0.44, 0.185, 0.8, 1.3, 0.5); }
  mesh(B(0.12, 0.012, 0.01), A6K.boca, 0, 0.35, 0.205, g);
  // gorro: casquete amarillo, orejeras que cuelgan a los lados y estrella roja delante
  const cas = mesh(new THREE.SphereGeometry(0.218, 12, 6, 0, TAU, 0, Math.PI * 0.37), A6K.gorro, 0, 0.42, -0.005, g); cas.scale.set(1.16, 0.95, 1.02);
  for (const s of [-1, 1]){ const f = mesh(B(0.035, 0.2, 0.16), A6K.gorro, 0.225 * s, 0.38, -0.03, g); f.rotation.z = 0.18 * s; }
  mesh(B(0.32, 0.14, 0.035), A6K.gorro, 0, 0.42, -0.2, g);   // faldón de la nuca
  const es = mesh(frogStarGeo, A6K.estrellaR, 0, 0.56, 0.172, g); es.scale.setScalar(0.06); es.rotation.x = -0.62;
  const tg = mesh(B(0.04, 0.02, 1), A6.tongue, 0, 0.35, 0.2, g); tg.geometry.translate(0, 0, 0.5); tg.scale.z = 0.01; g.userData.tg = tg; g.scale.setScalar(1.4); return g; }
function mkDog(){ const g = new THREE.Group(); scene.add(g); const head = new THREE.Group(); g.add(head);
  const h = mesh(new THREE.IcosahedronGeometry(0.95, 1), A6.dog, 0, 0, 0, head); h.scale.set(1.15, 1, 1.05);
  const sn = mesh(new THREE.IcosahedronGeometry(0.45, 1), A6.dog, 0, -0.25, 0.85, head); sn.scale.set(1, 0.75, 1);
  mesh(new THREE.IcosahedronGeometry(0.13, 0), A6.eyeK, 0, -0.05, 1.28, head);
  for (const s of [-1, 1]){ mesh(new THREE.IcosahedronGeometry(0.1, 0), A6.eyeK, 0.4 * s, 0.25, 0.85, head); const e = mesh(new THREE.ConeGeometry(0.25, 0.5, 5), A6.dog, 0.65 * s, 0.85, -0.1, head); e.rotation.z = -0.5 * s;
    const ei = mesh(new THREE.ConeGeometry(0.14, 0.32, 5), A6.dogIn, 0.65 * s, 0.82, 0.02, head); ei.rotation.z = -0.5 * s; }
  const jaw = new THREE.Group(); jaw.position.set(0, -0.5, 0.45); head.add(jaw); mesh(B(0.75, 0.12, 0.7), A6.dogM, 0, 0, 0.25, jaw); const lo = mesh(new THREE.IcosahedronGeometry(0.4, 1), A6.dog, 0, -0.12, 0.3, jaw); lo.scale.set(1, 0.4, 1);
  for (let i = 0; i < 4; i++){ const t = mesh(new THREE.ConeGeometry(0.05, 0.14, 4), A6.eyeW, -0.24 + i * 0.16, 0.08, 0.5, jaw); }
  g.userData = { head, jaw }; return g; }
function mkBot(){ const g = new THREE.Group(); scene.add(g);
  const legs = [-1, 1].map(s => { const L = mesh(B(0.12, 0.3, 0.14), A6.rW, 0.09 * s, 0.15, 0, g); mesh(B(0.14, 0.06, 0.2), A6.rB, 0.09 * s, 0.02, 0.02, g); return L; });
  mesh(B(0.32, 0.16, 0.2), A6.rG, 0, 0.36, 0, g); mesh(B(0.38, 0.26, 0.26), A6.rW, 0, 0.56, 0, g); mesh(B(0.3, 0.14, 0.04), A6.rB, 0, 0.6, 0.14, g); mesh(B(0.08, 0.06, 0.04), A6.rR, 0, 0.47, 0.14, g);
  const head = new THREE.Group(); head.position.y = 0.78; g.add(head); mesh(B(0.18, 0.16, 0.18), A6.rW, 0, 0, 0, head); mesh(B(0.14, 0.04, 0.02), A6.rY, 0, 0.01, 0.095, head); mesh(B(0.06, 0.08, 0.06), A6.rR, 0, 0.11, 0, head);
  for (const s of [-1, 1]){ mesh(B(0.1, 0.12, 0.12), A6.rB, 0.25 * s, 0.62, 0, g); mesh(B(0.08, 0.26, 0.08), A6.rW, 0.26 * s, 0.44, 0.02, g); }
  const gun = mesh(B(0.06, 0.06, 0.32), A6.rG, 0.26, 0.4, 0.16, g); g.userData = { head, gun }; g.scale.setScalar(1.3); return g; }
function mkTiara(){ const g = new THREE.Group(); scene.add(g); const r = mesh(new THREE.TorusGeometry(0.3, 0.035, 4, 18, Math.PI * 1.4), A6.gold, 0, 0, 0, g); r.rotation.z = -Math.PI * 0.2;
  mesh(new THREE.OctahedronGeometry(0.08, 0), A6.gem, 0, 0.3, 0, g); g.rotation.x = Math.PI / 2; return g; }

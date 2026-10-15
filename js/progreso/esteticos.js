'use strict';
/* ---------- Catálogo de estéticos ---------- */
const COS = {
  hat:     [['none', 'Sin sombrero', '🚫'], ['cap', 'Gorra de repartidor', '🧢'], ['cat', 'El gato del anticuario', '🐈'], ['pot', 'Olla de la abuela', '🍲'], ['crown', 'Corona de cartón', '👑'],
            ['halo', 'Aureola', '😇'], ['duck', 'Patito de goma', '🦆'], ['cone', 'Cono de tráfico', '🚧'], ['tophat', 'Sombrero de copa', '🎩']],
  glasses: [['none', 'Sin nada', '🚫'], ['mustache', 'Bigote de incógnito', '🥸'], ['pixel', 'Gafas «Así se hace»', '😎'], ['3d', 'Gafas 3D de cine', '🎬']],
  weapon:  [['staff', 'Bastón-linterna', '🏮'], ['baguette', 'Baguette legendaria', '🥖'], ['umbrella', 'Paraguas del anticuario', '☂️'], ['churro', 'Churro sin chocolate', '🥨'],
            ['chancla', 'La chancla de la abuela', '🩴'], ['chicken', 'Pollo de goma', '🐔']],
  effect:  [['none', 'Normal', '✨'], ['rainbow', 'Estela arcoíris', '🌈'], ['confetti', 'Golpes de confeti', '🎊'], ['money', 'Llueven billetes', '💸']],
  sound:   [['normal', 'Golpe normal', '🔊'], ['honk', 'Bocina de payaso', '🤡'], ['quack', 'Cuac', '🦆']],
  body:    [['normal', 'Normal', '🧍'], ['bighead', 'Modo cabezón', '🗿'], ['mini', 'Modo mini', '🐜'], ['gold', 'Tovan dorado', '🏆']],
  dance:   [['wave', 'Saludo', '👋'], ['dance', 'Baile del repartidor', '🕺'], ['dab', 'El dab', '🙆']],
  title:   [['Repartidor novato', 'Repartidor novato', '🏷️'], ['Becario', 'Becario', '🏷️'], ['Amigo de los gatos', 'Amigo de los gatos', '🏷️'], ['Imparable', 'Imparable', '🏷️'],
            ['Cliente VIP', 'Cliente VIP', '🏷️'], ['Leyenda del reparto', 'Leyenda del reparto', '🏷️']]
};
const COS_CATS = [['hat', 'Sombrero'], ['glasses', 'Cara'], ['weapon', 'Arma'], ['effect', 'Efecto'], ['sound', 'Sonido'], ['body', 'Cuerpo'], ['dance', 'Celebración'], ['title', 'Título']];
const COS_DEFAULT = { hat: 'none', glasses: 'none', weapon: 'staff', effect: 'none', sound: 'normal', body: 'normal', dance: 'wave', title: 'Repartidor novato' };
function cosSource(cat, id){ return ACH.find(a => a.rw.some(([c, i]) => c === cat && i === id)); }
function cosUnlocked(cat, id){ if (COS_DEFAULT[cat] === id) return true; const a = cosSource(cat, id); return !!(a && meta.ach[a.id]); }
function cosName(cat, id){ const x = COS[cat].find(c => c[0] === id); return x ? `${x[2]} ${x[1]}` : id; }

/* ---------- Modelos ---------- */
const Hm = { orange: makeMat(0xff7a1a), white: makeMat(0xf4f4f4), black: makeMat(0x16161a), red: makeMat(0xb8242a), yellow: makeMat(0xffd23a), beak: makeMat(0xff8a1a),
  card: makeMat(0xe8b848, { side: THREE.DoubleSide }), metal: makeMat(0x9aa0aa), halo: makeMat(0xffe070, { emissive: 1 }), gem1: makeMat(0xd83040, { emissive: 0.4 }), gem2: makeMat(0x3a7ad8, { emissive: 0.4 }),
  brown: makeMat(0x3a2418), lensR: makeMat(0xff3040, { emissive: 0.5 }), lensC: makeMat(0x30e0ff, { emissive: 0.5 }), shine: makeMat(0xffffff, { emissive: 1 }),
  crust: makeMat(0xd49a4a), crumb: makeMat(0xf0c880), churro: makeMat(0xd8a050), sugar: makeMat(0xfff8e8, { emissive: 0.3 }), sole: makeMat(0x2a6ad8), pink: makeMat(0xff6aa8),
  chick: makeMat(0xf6e050), comb: makeMat(0xe83030), umbr: makeMat(0xc8302a) };
const HATS = {};
function hat(id, y, hide, build){ const g = new THREE.Group(); g.position.y = y; g.visible = false; P.neck.add(g); build(g); HATS[id] = { g, hide }; }
HATS.cap = { g: capG, hide: true };
hat('cone', 0.47, true, g => { mesh(B(0.46, 0.04, 0.46), Hm.orange, 0, 0, 0, g); mesh(new THREE.ConeGeometry(0.2, 0.62, 10), Hm.orange, 0, 0.33, 0, g); mesh(C(0.1, 0.12, 0.08, 10), Hm.white, 0, 0.3, 0, g); });
hat('duck', 0.56, true, g => { const b = mesh(new THREE.IcosahedronGeometry(0.17, 0), Hm.yellow, 0, 0, 0, g); b.scale.set(1, 0.8, 1.2);
  mesh(new THREE.IcosahedronGeometry(0.1, 0), Hm.yellow, 0, 0.17, 0.1, g); mesh(B(0.1, 0.04, 0.09), Hm.beak, 0, 0.15, 0.21, g);
  for (const s of [-1, 1]) mesh(B(0.025, 0.025, 0.02), Hm.black, 0.05 * s, 0.2, 0.18, g); const t = mesh(new THREE.ConeGeometry(0.06, 0.12, 4), Hm.yellow, 0, 0.06, -0.2, g); t.rotation.x = -1.2; });
hat('tophat', 0.5, true, g => { mesh(C(0.34, 0.34, 0.03, 14), Hm.black, 0, 0, 0, g); mesh(C(0.21, 0.22, 0.42, 12), Hm.black, 0, 0.22, 0, g); mesh(C(0.225, 0.225, 0.07, 12), Hm.red, 0, 0.06, 0, g); });
hat('crown', 0.5, true, g => { mesh(C(0.27, 0.27, 0.13, 8, true), Hm.card, 0, 0.06, 0, g);
  for (let i = 0; i < 8; i++){ const a = i / 8 * TAU; mesh(new THREE.ConeGeometry(0.06, 0.15, 4), Hm.card, Math.sin(a) * 0.26, 0.2, Math.cos(a) * 0.26, g);
    if (i % 2 === 0) mesh(B(0.04, 0.04, 0.02), i % 4 ? Hm.gem2 : Hm.gem1, Math.sin(a) * 0.275, 0.06, Math.cos(a) * 0.275, g).rotation.y = a; } });
hat('pot', 0.48, true, g => { mesh(C(0.25, 0.29, 0.26, 12), Hm.metal, 0, 0.1, 0, g); mesh(C(0.25, 0.25, 0.02, 12), Hm.metal, 0, 0.24, 0, g);
  mesh(B(0.36, 0.05, 0.07), Hm.black, 0.42, 0.14, 0, g); mesh(C(0.035, 0.035, 0.06, 6), Hm.black, 0, 0.28, 0, g); });
hat('halo', 0.92, false, g => { const r = mesh(new THREE.TorusGeometry(0.22, 0.03, 4, 18), Hm.halo, 0, 0, 0, g); r.rotation.x = Math.PI / 2; });
hat('cat', 0.52, true, g => {
  mesh(B(0.26, 0.2, 0.38), Mr.cat, 0, 0.1, -0.02, g);
  const h = new THREE.Group(); h.position.set(0, 0.3, 0.14); g.add(h); mesh(B(0.24, 0.2, 0.2), Mr.cat, 0, 0, 0, h);
  for (const s of [-1, 1]){ const e = mesh(new THREE.ConeGeometry(0.05, 0.12, 4), Mr.cat, 0.07 * s, 0.14, 0, h); e.rotation.z = -0.2 * s; mesh(B(0.05, 0.04, 0.02), Mr.catEye, 0.055 * s, 0.02, 0.105, h);
    mesh(B(0.07, 0.14, 0.07), Mr.cat, 0.1 * s, -0.08, 0.16, g); }
  const t = new THREE.Group(); t.position.set(0, 0.08, -0.2); g.add(t); mesh(B(0.05, 0.05, 0.36), Mr.cat, 0, 0, -0.18, t); g.userData.tail = t; g.userData.head = h; });
const GLASSES = {};
function glasses(id, y, z, build){ const g = new THREE.Group(); g.position.set(0, y, z); g.visible = false; P.neck.add(g); build(g); GLASSES[id] = g; }
glasses('pixel', 0.29, 0.235, g => {
  mesh(B(0.46, 0.035, 0.03), Hm.black, 0, 0.045, 0, g);
  for (const s of [-1, 1]){ mesh(B(0.17, 0.07, 0.03), Hm.black, 0.1 * s, 0.0, 0, g); mesh(B(0.11, 0.035, 0.03), Hm.black, 0.1 * s + 0.02 * s, -0.045, 0, g);
    mesh(B(0.03, 0.03, 0.01), Hm.shine, 0.06 * s - 0.02, 0.02, 0.018, g); mesh(B(0.03, 0.03, 0.01), Hm.shine, 0.1 * s - 0.02, -0.01, 0.018, g); } });
glasses('mustache', 0.17, 0.24, g => { mesh(B(0.2, 0.05, 0.03), Hm.brown, 0, 0, 0, g);
  for (const s of [-1, 1]){ const e = mesh(B(0.08, 0.04, 0.03), Hm.brown, 0.12 * s, 0.02, 0, g); e.rotation.z = 0.5 * s; } });
glasses('3d', 0.29, 0.235, g => { mesh(B(0.46, 0.11, 0.02), Hm.white, 0, 0.01, 0, g); mesh(B(0.16, 0.07, 0.02), Hm.lensR, -0.1, 0.0, 0.012, g); mesh(B(0.16, 0.07, 0.02), Hm.lensC, 0.1, 0.0, 0.012, g); });
const WEAPONS = {};
function weapon(id, build){ const g = new THREE.Group(); g.visible = false; staff.add(g); build(g); WEAPONS[id] = g; }
weapon('baguette', g => { mesh(C(0.08, 0.07, 1.55, 8), Hm.crust, 0, 0, 0, g); for (let i = 0; i < 5; i++){ const c = mesh(B(0.025, 0.16, 0.06), Hm.crumb, 0.07, -0.5 + i * 0.25, 0, g); c.rotation.z = 0.6; }
  mesh(new THREE.IcosahedronGeometry(0.075, 0), Hm.crust, 0, -0.78, 0, g); });
weapon('umbrella', g => { mesh(C(0.02, 0.02, 1.5, 5), Hm.black, 0, 0, 0, g); const hdl = mesh(new THREE.TorusGeometry(0.1, 0.025, 4, 8, Math.PI), Hm.black, 0.1, -0.75, 0, g); hdl.rotation.z = Math.PI;
  mesh(new THREE.ConeGeometry(0.12, 1.0, 8), Hm.umbr, 0, 0.18, 0, g); mesh(C(0.125, 0.125, 0.04, 8), Hm.white, 0, -0.1, 0, g); });
weapon('churro', g => { mesh(C(0.065, 0.065, 1.5, 6), Hm.churro, 0, 0, 0, g);
  for (let i = 0; i < 16; i++){ const a = rnd() * TAU; mesh(B(0.02, 0.02, 0.02), Hm.sugar, Math.cos(a) * 0.066, -0.7 + rnd() * 1.4, Math.sin(a) * 0.066, g); } });
weapon('chancla', g => { mesh(B(0.32, 1.1, 0.07), Hm.sole, 0, 0, 0, g); mesh(B(0.26, 0.2, 0.08), Hm.sole, 0, 0.6, 0, g); mesh(B(0.3, 1.0, 0.02), Hm.pink, 0, 0.02, 0.045, g);
  for (const s of [-1, 1]){ const st = mesh(B(0.04, 0.34, 0.04), Hm.white, 0.08 * s, 0.32, 0.08, g); st.rotation.z = 0.45 * s; } mesh(B(0.05, 0.05, 0.08), Hm.white, 0, 0.5, 0.08, g); });
weapon('chicken', g => { mesh(C(0.11, 0.06, 1.0, 8), Hm.chick, 0, -0.15, 0, g); mesh(C(0.045, 0.07, 0.3, 6), Hm.chick, 0, 0.47, 0, g);
  mesh(new THREE.IcosahedronGeometry(0.09, 0), Hm.chick, 0, 0.64, 0.02, g); mesh(B(0.04, 0.1, 0.08), Hm.comb, 0, 0.73, 0, g); mesh(B(0.05, 0.04, 0.1), Hm.beak, 0, 0.63, 0.1, g);
  for (const s of [-1, 1]){ mesh(C(0.012, 0.012, 0.2, 4), Hm.beak, 0.04 * s, -0.72, 0, g); mesh(B(0.08, 0.02, 0.08), Hm.beak, 0.04 * s, -0.82, 0.02, g); } });
const staffBase = [staff.children[0], staff.children[1]];

/* ---------- Aplicar estéticos ---------- */
const HERO_MATS = [M.coat, M.coatDS, M.pants, M.boot, M.glove, M.skin, M.hair, M.face, M.scarf, M.gold, M.belt, M.wood];
const heroMatOrig = HERO_MATS.map(m => [m.uniforms.uColor.value.getHex(), m.uniforms.uEmissive.value]);
let goldOn = false;
function applyCosmetics(intro){
  const c = meta.cos;
  if (!intro){
    for (const [id, h] of Object.entries(HATS)) h.g.visible = c.hat === id;
    const hide = c.hat !== 'none' && HATS[c.hat] && HATS[c.hat].hide; hairTop.forEach(h => { h.visible = !hide; });
  } else for (const [id, h] of Object.entries(HATS)) if (id !== 'cap') h.g.visible = false;
  for (const [id, g] of Object.entries(GLASSES)) g.visible = !intro && c.glasses === id;
  const w = intro ? 'staff' : c.weapon;
  staffBase.forEach(o => { o.visible = w === 'staff'; }); for (const [id, g] of Object.entries(WEAPONS)) g.visible = w === id;
  hero.scale.setScalar((c.body === 'mini' ? 0.62 : 1) * (1 + 0.07 * lvl('giant')));
  setHeroGlitch(!intro && c.body === 'missing' ? 1 : 0);
  const big = c.body === 'bighead' ? 1.4 : 1; P.neck.scale.set(1.45 * big, 1.42 * big, 1.45 * big);
  const wantGold = !intro && (c.body === 'gold' || c.body === 'gold2'), plat = c.body === 'gold2';
  if (goldOn && !wantGold){ HERO_MATS.forEach((m, i) => { m.uniforms.uColor.value.setHex(heroMatOrig[i][0]); m.uniforms.uEmissive.value = heroMatOrig[i][1]; }); goldOn = false; if (!intro) setOutfit('hero'), applyCosmetics(false); }
  if (wantGold){ HERO_MATS.forEach(m => { m.uniforms.uColor.value.setHex(m.uniforms.uHasMap.value ? (plat ? 0xcfdcff : 0xffd878) : (plat ? 0xc4cede : 0xe8b040)); m.uniforms.uEmissive.value = plat ? 0.34 : 0.22; }); goldOn = true; }
  const ht = document.getElementById('hudTitle'); if (ht) ht.textContent = c.title;
}

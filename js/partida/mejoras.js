'use strict';
/* ---------- Mejoras ---------- */
const RAR = { comun: ['Común', '#cfd6ff', 60], rara: ['Rara', '#7fe0ff', 30], epica: ['Épica', '#ffd970', 10] };
const UPGRADES = [
  { id: 'dmg',     r: 'comun', name: 'Filo de cristal',    desc: '+20 % de daño en todos tus golpes.', max: 5, apply: () => { up.dmg += 0.2; } },
  { id: 'crit',    r: 'comun', name: 'Ojo certero',        desc: '+10 % de probabilidad de crítico.', max: 4, apply: () => { up.crit += 0.1; } },
  { id: 'hp',      r: 'comun', name: 'Corazón de piedra',  desc: '+25 PV máximos y te cura 25 PV.', max: 5, apply: () => { player.maxHp += 25; heal(25, true); } },
  { id: 'potion',  r: 'comun', name: 'Poción de las ruinas', desc: 'Recuperas el 40 % de tus PV.', max: 99, apply: () => heal(player.maxHp * 0.4, true) },
  { id: 'speed',   r: 'comun', name: 'Pies ligeros',       desc: '+50 % de velocidad de movimiento. Con tres, vas el doble de rápido.', max: 3, apply: () => { up.speed += taken.speed > 1 ? 0.25 : 0.5; } },
  { id: 'armor',   r: 'comun', name: 'Piel de hierro',     desc: 'Recibes un 18 % menos de daño.', max: 3, apply: () => { up.armor += 0.18; } },
  { id: 'meter',   r: 'comun', name: 'Ímpetu',             desc: 'La barra especial se llena un 40 % más rápido.', max: 3, apply: () => { up.meterRate += 0.4; } },
  { id: 'life',    r: 'rara',  name: 'Linterna vampírica', desc: 'Cada golpe de bastón que aciertas te cura 2 PV.', max: 3, apply: () => { up.lifesteal += 2; } },
  { id: 'slam',    r: 'rara',  name: 'Temblor',            desc: 'El golpe final alcanza un 50 % más lejos y pega un 50 % más.', max: 3, apply: () => { up.slamBoost++; } },
  { id: 'fire',    r: 'rara',  name: 'Voltereta ígnea',    desc: 'Al rodar dejas un rastro de fuego que prende a los enemigos.', max: 3, apply: () => { up.fireRoll++; } },
  { id: 'quake',   r: 'rara',  name: 'Salto sísmico',      desc: 'Al aterrizar de un salto dañas a todo lo que tengas cerca.', max: 3, apply: () => { up.quake++; } },
  { id: 'orb',     r: 'rara',  name: 'Cristal guardián',   desc: 'Un cristal orbita a tu alrededor y daña al contacto.', max: 3, apply: () => { up.orbs++; addOrb(); } },
  { id: 'spin',    r: 'epica', name: 'Remolino',           desc: 'Añade un giro de 360° al combo antes del golpe final.', max: 1, apply: () => { up.spin = true; } },
  { id: 'reflect', r: 'epica', name: 'Devolver orbes',     desc: 'Golpea los orbes de los centinelas para devolvérselos.', max: 1, apply: () => { up.reflect = true; } },
  { id: 'perfect', r: 'epica', name: 'Esquiva perfecta',   desc: 'Si ruedas en el último instante antes de un golpe, el tiempo se ralentiza y tus golpes son críticos (recarga 5 s).', max: 1, apply: () => { up.perfect = true; } }
];
let offer = [];
const upScr = document.getElementById('upScr'), cardsEl = document.getElementById('cards');
function openUpgrades(){
  gameState = 'upgrade'; play('upgradeOpen'); setSong('title'); bannerEl.hidden = true; bannerT = 0;
  dealCards();
  upScr.hidden = false;
  setTimeout(() => { const f = cardsEl.querySelector('button'); if (f) f.focus({ preventScroll: true }); }, 50);
}
const weightOf = u => RAR[u.r][2] * (u.r === 'rara' ? 1 + 0.35 * ml('luck') : u.r === 'epica' ? 1 + 0.6 * ml('luck') : 1);
function dealCards(){
  const avail = UPGRADES.filter(u => (taken[u.id] || 0) < u.max && (!u.req || u.req()));
  offer = [];
  const nCards = 3 + ml('choice');
  if (forceLegend){ forceLegend = false; const lg = avail.filter(u => u.r === 'leyenda'), alt = lg.length ? lg : avail.filter(u => u.r === 'epica'); if (alt.length) offer.push(alt[Math.floor(rnd() * alt.length)]); }
  const newLeg = avail.filter(u => u.r === 'leyenda' && !shownLeg.has(u.id) && !offer.includes(u));
  if (newLeg.length) offer.push(newLeg[Math.floor(rnd() * newLeg.length)]);
  while (offer.length < nCards && offer.length < avail.length){
    const cands = avail.filter(u => !offer.includes(u)), tot = cands.reduce((s, u) => s + weightOf(u), 0);
    let r = rnd() * tot; for (const u of cands){ r -= weightOf(u); if (r <= 0){ offer.push(u); break; } }
  }
  for (const u of offer) if (u.r === 'leyenda') shownLeg.add(u.id);
  cardsEl.innerHTML = '';
  offer.forEach((u, i) => {
    const b = document.createElement('button'); b.className = 'win card r-' + u.r; b.style.animationDelay = (i * 0.07) + 's';
    const lv = taken[u.id] || 0;
    const completes = (u.tags || []).filter(t => (tagCnt[t] || 0) === 2);
    b.innerHTML = `<span class="key">${i + 1}</span><span class="cic">${u.ic}</span><span class="rar" style="color:${RAR[u.r][1]}">${RAR[u.r][0]}</span>` +
      `<span class="cname">${u.name}</span><span class="cdesc">${u.desc}</span>` +
      ((u.tags || []).length ? `<span class="ctags">${u.tags.map(t => `<span class="chip sm" style="--c:${TAGS[t].col}">${TAGS[t].ic} ${TAGS[t].n}</span>`).join('')}</span>` : '') +
      (completes.length ? `<span class="cset">¡Activa el bonus de ${completes.map(t => TAGS[t].n).join(' y ')}!</span>` : '') +
      (u.tech && up.tech && up.tech !== u.id ? `<span class="cset warn">Sustituye a ${TECH_NAMES[up.tech]}</span>` : '') +
      (u.max > 1 && u.max < 99 ? `<span class="lvl">Nivel ${lv + 1} / ${u.max}</span>` : '');
    b.addEventListener('click', () => chooseUpgrade(i));
    b.addEventListener('pointerenter', () => play('cursor')); b.addEventListener('focus', () => play('cursor'));
    cardsEl.appendChild(b);
  });
  rerollBtn.hidden = rerolls <= 0; rerollBtn.textContent = `↻ Relanzar (${rerolls})`;
  document.getElementById('upBuild').innerHTML = chipsHTML() || '<span class="dim">Elige tu primera mejora: las familias con 3 cartas activan un bonus</span>';
  if (offer.some(u => u.r === 'leyenda')) play('legend');
}
const rerollBtn = document.getElementById('rerollBtn');
function doReroll(){ if (gameState !== 'upgrade' || rerolls <= 0) return; rerolls--; play('confirm'); dealCards(); const f = cardsEl.querySelector('button'); if (f) f.focus({ preventScroll: true }); }
rerollBtn.addEventListener('click', doReroll);
function chooseUpgrade(i){
  if (gameState !== 'upgrade' || !offer[i]) return;
  const u = offer[i]; taken[u.id] = (taken[u.id] || 0) + 1; u.apply(); play('confirm'); recountTags();
  if ((u.tags || []).includes('otaku')) barkOnce('otaku', 'No pillo las referencias. Soy una linterna. Pero suena fuerte.');
  if (u.r === 'leyenda') unlock('legend');
  if (u.r === 'leyenda') barkOnce('leg', 'Uy, eso brilla más que yo. No me gusta. Me encanta.');
  upScr.hidden = true; gameState = 'play'; afterUpgrade();
}
const orbMat = makeMat(0x8ff6ff, { emissive: 1 });
function addOrb(){ const m = mesh(new THREE.OctahedronGeometry(0.14, 0), orbMat, 0, 1, 0); m.scale.y = 1.6; orbs.push(m); }

'use strict';
/* ---------- Poderes acumulables: cada copia mejora el efecto ---------- */
const STK10 = { spin: [3, 'el giro pega +50 %'], perfect: [3, 'recarga 1,5 s antes'], glacial: [3, 'enfría más fuerte'], static: [4, '+1 rayo al rodar'], after: [4, 'onda más grande y +12 de daño'],
  frenzy: [3, 'más bonus de combo'], pyre: [3, '+50 % de daño y +20 % de radio'], shards: [3, '+50 % de daño y congelan más'], thunder: [3, '+6 rayos'], prism: [3, 'disparan más a menudo'],
  feast: [3, '+5 PV y más ÍMP por baja'], supernova: [3, '+1 explosión en cadena'], zero: [3, 'congela más tiempo y más esquirlas'], tempest: [3, '+50 % de daño y +1 salto'], phoenix: [3, '+1 resurrección'],
  kame: [3, 'tus técnicas pegan +35 %'], world: [3, '+1,5 s de tiempo parado'], genki: [3, 'tus técnicas pegan +35 %'], omae: [3, 'el «¿NANI?» pega +60 %'], clones: [3, 'los clones pegan +25 %'],
  super: [3, 'te transformas con 12 de combo menos y +15 % de daño'], stonks: [3, 'más % por baja y +30 % de tope'], truck: [4, 'el camión pasa más a menudo'], note: [3, 'apuntas 4 s antes; a los jefes, +5 %'],
  fine: [3, 'se activa antes y +25 % de daño'], chain: [3, '+14 % de probabilidad de rebote'], boom: [3, '+10 % de probabilidad de explosión'], poison: [3, 'el veneno hace +60 % de daño'],
  venomBlade: [3, '+1 dosis de veneno por golpe'], plague: [3, 'contagia más lejos y más dosis'], mirror: [3, 'más proyectiles en abanico'], echo: [3, '+1 eco más'], returns: [4, '+22 de daño al devolver'],
  tracking: [3, '+20 % de daño al marcado'], deliveryGod: [3, 'más furgonetas y +30 % de daño'], magnet: [3, 'los orbes curan +3 PV'], cafe: [5, '+10 % de velocidad de ataque'], meterKill: [4, 'más ÍMP por baja'],
  springs: [3, '+1 salto en el aire'], lucky: [4, '+6 % de crítico y más ÍMP'], siesta: [4, '+0,8 % de PV por segundo'], berserk: [3, '+25 % de velocidad extra'], thorns: [4, 'devuelves aún más daño'],
  frostArmor: [3, 'congela más y recarga antes'], overcharge: [4, 'rayos más largos y fuertes'], dashTrail: [4, 'el rastro pega más'], pogo: [4, 'el picado pega más'], bigSpecial: [4, '+40 % de daño y +30 % de alcance'],
  comboShield: [3, 'pide menos combo, para más y recarga antes'], bananas: [4, 'sueltas pieles más a menudo'], lumen: [5, 'Lumen dispara más rápido (y se queja más)'], domino: [4, 'los despedidos pegan más'],
  midas: [3, '+25 % de fragmentos y más billetes'], pinata: [3, '+1 caramelo por crítico'], secondWind: [3, '+6 % de cura y +1 s intocable'], blizzard: [3, 'más a menudo, más larga y más daño'], meteor: [3, '+5 meteoritos'],
  ghost: [3, 'recarga antes y dura más'], bulletTime: [3, 'recarga antes y dura más'], glassCannon: [3, '+45 % de daño y −12 % de PV'], vampOrbs: [3, '+1 PV por golpe'], blackhole: [3, '+1 s de agujero negro'],
  avatar: [3, 'estados un 50 % más fuertes'], capture: [3, 'lanzas la bola más a menudo'], culito: [3, 'recarga 1 s antes'], kamen: [4, 'disparas más a menudo'], cards: [3, 'cartas más a menudo'],
  toya: [3, '+8 % de probabilidad y +50 % de daño'], strawberry: [3, '+15 % de daño'], bigdog: [3, 'el perro sale más a menudo'], frogs: [4, '+1 rana y llegan antes'], gunpla: [4, '+1 robot'], gomu: [3, '+15 % de alcance'],
  bankai: [3, '+3 s y +25 % de daño'], atfield: [3, 'recarga 2,5 s antes'], waterBreath: [3, 'la ola sale un golpe antes'], tiara: [4, 'tiaras más a menudo'], soot: [4, 'más hollín y más daño'], pocket: [3, 'el guante pega +20 %'],
  jan: [3, 'cargas el puño con 3 golpes menos'], diamond: [3, 'más radio y más congelación'], alchemy: [3, 'pinchos más largos'], titan: [3, 'ruedas aún más lejos'], parcel: [5, 'paquetes más a menudo y +1 en el suelo'],
  orbit: [3, '+2 orbitales'], giant: [3, 'todo un 30 % más grande'], life: [5, '+3,5 PV por golpe'], fireEdge: [3, 'quema más fuerte'], frost: [3, 'enfría más'], storm: [3, 'rayos más largos'],
  slam: [3, 'remate más grande'], fire: [3, 'rastro más fuerte'], quake: [3, 'aterrizaje más fuerte'], orb: [3, '+1 cristal'], express: [3, 'más velocidad y daño tras rodar'],
  dmg: [5, '+20 % de daño'], crit: [4, '+10 % de crítico'], hp: [5, '+25 PV'], speed: [3, '+15 % de velocidad'], armor: [3, '−12 % de daño recibido'], meter: [3, 'barra más rápida'] };
for (const [id, [mx, txt]] of Object.entries(STK10)){ const u = UPGRADES.find(x => x.id === id); if (u){ u.max = Math.max(u.max, mx); u.stk = txt; } }
const _cosDmgMul10 = cosDmgMul;
cosDmgMul = function(e, src){
  let m = _cosDmgMul10(e, src); if (src === 'dot') return m;
  if (state === 'tech') m *= 1 + 0.35 * (S10('kame') + S10('genki'));
  if (state === 'attack' && curMove && curMove.name === 'spin') m *= 1 + 0.5 * S10('spin');
  return m;
};

/* ---------- Especiales de rama: con 3 poderes de una familia, su especial sale en las cartas ---------- */
const crysMat10 = makeMat(0xd8c8ff, { emissive: 0.7 }), crysGeo10 = new THREE.OctahedronGeometry(0.42, 0);
const moonMat10 = makeMat(0xff2a3a, { emissive: 1, opacity: 0.85 }), moonGeo10 = new THREE.IcosahedronGeometry(1.3, 1);
const liveE10 = () => enemies.filter(e => e.alive && e.spawnT <= 0);
const BR10 = {
  fuego: { id: 'brFuego', ic: '🌋', name: 'Infierno a domicilio', short: 'tres anillos de columnas de fuego',
    desc: 'ESPECIAL · Al usar tu especial (L) brotan tres anillos de columnas de fuego a tu alrededor. Entrega en mano, y en llamas.',
    fx(k){ const H = hero.position.clone(); banner('¡Infierno a domicilio!', 1); flash('#ff7a2a', 0.35); play('boom');
      [2.4, 4.2, 6.0].forEach((R, ri) => later(0.12 + ri * 0.28, () => { const n = 6 + ri * 3;
        for (let i = 0; i < n; i++){ const a = i / n * TAU + ri * 0.4, x = H.x + Math.cos(a) * R, z = H.z + Math.sin(a) * R; if (Math.hypot(x, z) > ARENA + 0.3) continue;
          explode(x, z, 1.5, 0xff6a20, 38 * k, { el: 'fire', sfx: i ? 'none' : 'fireball', kind: 'pyre', knock: 3 }); pillar7(x, z, 0xff6a20, 0xffe070, 0.5, 0.6); } })); } },
  hielo: { id: 'brHielo', ic: '🧊', name: 'Glaciación exprés', short: 'congela toda la arena y la hace añicos',
    desc: 'ESPECIAL · Tu especial congela a todos los enemigos de la arena 3 s y después revientan en esquirlas. Se recomienda abrigo.',
    fx(k){ const H = hero.position; banner('¡Glaciación exprés!', 1); flash('#dff6ff', 0.45); play('freeze'); crystals7(H.x, H.z, 16, 7);
      for (let i = 0; i < 3; i++) later(i * 0.12, () => gring(H.x, 0.1, H.z, i % 2 ? 0xffffff : 0x9fe8ff, 0.5, 9 + i, 0.6));
      const list = liveE10(); for (const e of list){ if (e.isBoss) applyStatus(e, 'ice', 3); else freezeEnemy(e, 3 + S10('brHielo')); }
      later(1.3, () => { for (const e of list) if (e.alive) explode(e.g.position.x, e.g.position.z, 1.6, 0x9fe8ff, 40 * k, { el: 'ice', sfx: 'shatter', kind: 'shatter', knock: 2 }); }); } },
  rayo: { id: 'brRayo', ic: '🌩️', name: 'Tormenta perfecta', short: 'un rayo sobre cada enemigo',
    desc: 'ESPECIAL · Tu especial hace caer un rayo sobre cada enemigo y salta en cadena. Desenchufa los electrodomésticos.',
    fx(k){ banner('¡Tormenta perfecta!', 1); flash('#fff6b0', 0.4); const list = liveE10().slice(0, 16);
      list.forEach((e, i) => later(0.1 + i * 0.07, () => { if (!e.alive) return; skyStrike(e, 45 * k); const n = nearestFrom(e.g.position.x, e.g.position.z, 4, new Set([e])); if (n) chainLightning(e.g.position.x, 1, e.g.position.z, n, 2, 20 * k); })); } },
  cristal: { id: 'brCristal', ic: '🔮', name: 'Lluvia de cristal', short: '18 cristales gigantes del cielo',
    desc: 'ESPECIAL · Tu especial hace llover 18 cristales gigantes sobre los enemigos. Siete años de mala suerte… para ellos.',
    fx(k){ banner('¡Lluvia de cristal!', 1); flash('#d8c8ff', 0.3); play('shatter');
      for (let i = 0; i < 18; i++) later(0.1 + i * 0.07, () => { const L = liveE10(); let x, z;
        if (L.length && rnd() < 0.8){ const e = pick10(L); x = e.g.position.x + (rnd() - 0.5) * 0.8; z = e.g.position.z + (rnd() - 0.5) * 0.8; }
        else { const a = rnd() * TAU, r = 1 + rnd() * 5; x = hero.position.x + Math.cos(a) * r; z = hero.position.z + Math.sin(a) * r; }
        const v = clampArena(new V3(x, 0, z)), m = mesh(crysGeo10, crysMat10, v.x, 10, v.z); m.scale.set(1, 2, 1);
        hzFx({ upd(dt){ this.t += dt; m.position.y = 10 * (1 - Math.min(1, this.t / 0.35) ** 2); m.rotation.y += dt * 8;
          if (this.t >= 0.35 && !this.hit){ this.hit = true; explode(v.x, v.z, 1.5, 0xb69cff, 34 * k, { sfx: 'shatter', kind: 'shatter', knock: 3 }); } return this.t > 0.6; }, end(){ scene.remove(m); } }); }); } },
  impacto: { id: 'brImpacto', ic: '🌍', name: 'Terremoto', short: 'tres ondas sísmicas gigantes',
    desc: 'ESPECIAL · Tu especial suelta tres ondas sísmicas gigantes que lo mandan todo por los aires. Los vecinos de abajo no están contentos.',
    fx(k){ const H = hero.position.clone(); banner('¡Terremoto!', 1); flash('#ffc070', 0.3);
      [3.5, 5.5, 7.5].forEach((R, i) => later(0.15 + i * 0.3, () => { explode(H.x, H.z, R, 0xffc070, 50 * k, { kind: 'impact', knock: 9, sfx: 'slam' }); shake = Math.max(shake, 0.6);
        gring(H.x, 0.1, H.z, 0xffe0a0, 0.5, R * 1.1, 0.45); crack7(H.x, H.z, 6 + i * 2, R * 0.8, true); })); } },
  sangre: { id: 'brSangre', ic: '🌕', name: 'Luna de sangre', short: 'roba vida a todo lo cercano',
    desc: 'ESPECIAL · Tu especial alza una luna roja que roba vida a todos los enemigos cercanos y te la da a ti (hasta un 35 % de tu vida). Muy gótico.',
    fx(k){ const H = hero.position; banner('¡Luna de sangre!', 1); flash('#ff2a3a', 0.4); play('roar');
      const moon = mesh(moonGeo10, moonMat10, H.x, 6, H.z); hzFx({ upd(dt){ this.t += dt; moon.scale.setScalar(Math.min(1, this.t * 3) * (1 - Math.max(0, this.t - 1.2) * 2)); moon.position.set(hero.position.x, 6, hero.position.z); return this.t > 1.7; }, end(){ scene.remove(moon); } });
      let got = 0; const list = liveE10().filter(e => Math.hypot(e.g.position.x - H.x, e.g.position.z - H.z) < 7.5);
      list.forEach((e, i) => later(0.2 + i * 0.05, () => { if (!e.alive) return; const v = rdmg(45 * k), hp0 = e.hp; hitEnemy(e, v, false, 0, 0, 1, 1, false, { src: 'aoe' });
        bolt(e.g.position.x, 1, e.g.position.z, hero.position.x, 1.2, hero.position.z, 0xff2a3a, 0.06); got += Math.max(0, hp0 - Math.max(0, e.hp)); }));
      later(0.4 + list.length * 0.05, () => { if (player.dead) return; const h = Math.min(player.maxHp * 0.35, got * 0.4 + player.maxHp * 0.05); heal(Math.round(h)); }); } },
  veneno: { id: 'brVeneno', ic: '☁️', name: 'Nube tóxica', short: 'una nube de veneno que te sigue 6 s',
    desc: 'ESPECIAL · Tu especial te envuelve en una nube de veneno enorme durante 6 s. Huele fatal. A ti no te afecta: ya estás acostumbrado.',
    fx(k){ banner('¡Nube tóxica!', 1); play('freeze'); let tick = 0;
      hzFx({ upd(dt){ this.t += dt; tick -= dt; const H = hero.position;
          for (let j = 0; j < 4; j++){ const a = rnd() * TAU, r = rnd() * 4.5; pa(H.x + Math.cos(a) * r, 0.2 + rnd() * 1.2, H.z + Math.sin(a) * r, 0, 0.4, 0, rnd() < 0.6 ? 0x7dff5a : 0x4ac83a, 0.45, 0.9, -0.3, 1, 1.5, SH7.dot, 0.5); }
          if (tick <= 0){ tick = 0.5; for (const e of liveE10()) if (Math.hypot(e.g.position.x - H.x, e.g.position.z - H.z) - e.r < 4.5){ applyStatus(e, 'poison', 2); hitEnemy(e, rdmg(6 * k), false, 0, 0, 0, 0, false, { src: 'aoe' }); } }
          return this.t > 6 + S10('brVeneno'); } }); } },
  otaku: { id: 'brOtaku', ic: '🎬', name: '¡Final de temporada!', short: 'explosión de protagonista y 3 s intocable',
    desc: 'ESPECIAL · Tu especial activa el capítulo final: zoom dramático, explosión de protagonista y 3 s intocable. Se viene opening.',
    fx(k){ const H = hero.position.clone(); banner('¡FINAL DE TEMPORADA!<small>(no te levantes, hay escena poscréditos)</small>', 1.4); flash('#ffffff', 0.5); play('superOn');
      player.inv = Math.max(player.inv, 3); shoutHero7('¡ESTE NO ES MI FINAL!', '#ff7ad8', 3.2);
      for (let i = 0; i < 8; i++){ const a = i / 8 * TAU; later(0.1 + i * 0.03, () => bolt(H.x, 1, H.z, H.x + Math.cos(a) * 7, 1, H.z + Math.sin(a) * 7, 0xff7ad8, 0.1)); }
      later(0.45, () => { explode(H.x, H.z, 7, 0xff7ad8, 90 * k, { kind: 'nova', knock: 8 }); pillar7(H.x, H.z, 0xff7ad8, 0xffffff, 1.2, 1.4); }); } },
  reparto: { id: 'brReparto', ic: '🚚', name: 'Envío masivo', short: '10 paquetes explosivos del cielo',
    desc: 'ESPECIAL · Tu especial hace llover 10 paquetes explosivos sobre los enemigos. Sin firma, sin acuse de recibo, sin piedad.',
    fx(k){ banner('¡Envío masivo!', 1); play('truckHorn');
      for (let i = 0; i < 10; i++) later(0.1 + i * 0.1, () => { const L = liveE10(); let x, z;
        if (L.length){ const e = pick10(L); x = e.g.position.x; z = e.g.position.z; } else { const a = rnd() * TAU, r = 1 + rnd() * 4; x = hero.position.x + Math.cos(a) * r; z = hero.position.z + Math.sin(a) * r; }
        const v = clampArena(new V3(x, 0, z)), g = makeParcel(v.x, v.z); g.position.y = 9; g.scale.setScalar(1.8);
        hzFx({ upd(dt){ this.t += dt; g.position.y = 9 * (1 - Math.min(1, this.t / 0.4) ** 2); g.rotation.x += dt * 7;
          if (this.t >= 0.4 && !this.hit){ this.hit = true; explode(v.x, v.z, 1.9, 0xe0a860, 45 * k, { kind: 'impact', knock: 5 }); tA.set(v.x, 2.2, v.z); spawnNumber(tA, pick10(['¡ENTREGA!', '¡Firme aquí!', '¡Contra reembolso!', '¡Frágil!']), 'react', '#ffd060'); }
          return this.t > 0.5; }, end(){ scene.remove(g); } }); }); } }
};
for (const t of Object.keys(BR10)){ const B = BR10[t];
  UPGRADES.push({ id: B.id, r: 'leyenda', tags: [t], ic: B.ic, name: B.name, desc: B.desc, max: 3, branch: t, stk: '+50 % de daño y efecto más grande', req: () => setOn(t), apply: () => {} }); }
const _doSpecial10 = doSpecial;
doSpecial = function(){ const m0 = player.meter; _doSpecial10(); if (m0 >= 100 && player.meter < 100 && !invActive && !MG.active && gameState === 'play') branchFire10(); };
function branchFire10(){ let d = 0;
  for (const t of Object.keys(BR10)){ const B = BR10[t]; if (!lvl(B.id)) continue; const k = 1 + 0.5 * S10(B.id);
    later(0.35 + d, () => { if (!player.dead && gameState === 'play') try { B.fx(k); } catch (err) { console.error(err); } }); d += 0.5; } }
const _setActivated10 = setActivated;
setActivated = function(t){ _setActivated10(t); const B = BR10[t];
  if (B && lvl(B.id) < 3){ P10.force.push(t); later(2.9, () => banner(`${B.ic} ¡Especial de rama desbloqueado!<small>«${B.name}» ya puede salirte en las cartas: ${B.short}. Se lanza con tu especial (L).</small>`, 2.6)); } };

/* ---------- Cartas: qué mejora si repites y qué bonus de familia consigues ---------- */
const upBonus10 = document.createElement('div'); upBonus10.id = 'upBonus10'; document.getElementById('upBuild').after(upBonus10);
/* (estilos de esta parte: css/cartas-v10.css) */
function famLine10(t){ const n = tagCnt[t] || 0, T = TAGS[t];
  if (n >= 3) return `<span class="cfam" style="--c:${T.col}">${T.ic} Bonus de ${T.n} activo</span>`;
  if (n === 2) return `<span class="cfam go" style="--c:${T.col}">${T.ic} ${T.n} 2/3 · ¡Con esta activas su bonus${BR10[t] ? ' y su especial' : ''}!</span>`;
  return `<span class="cfam" style="--c:${T.col}">${T.ic} ${T.n}: ${n + 1}/3 con esta</span>`; }
function renderCards10(){
  cardsEl.innerHTML = '';
  offer.forEach((u, i) => {
    const b = document.createElement('button'); b.className = 'win card r-' + u.r + (u.w ? ' wcard' : '') + (u.branch ? ' brcard' : ''); b.style.animationDelay = (i * 0.07) + 's';
    const lv = taken[u.id] || 0, fresh = meta.pwNew && meta.pwNew[u.id];
    b.innerHTML = `<span class="key">${i + 1}</span><span class="cic">${u.ic}</span><span class="rar" style="color:${RAR[u.r][1]}">${u.branch ? '✦ ESPECIAL DE RAMA' : u.w ? '⚔ ' + (cosName('weapon', u.w).split(' ').slice(1).join(' ')) : RAR[u.r][0]}${fresh ? ' <b class="cnew">¡NUEVA!</b>' : ''}</span>` +
      `<span class="cname">${u.name}</span><span class="cdesc">${u.desc}</span>` +
      ((u.tags || []).length ? `<span class="ctags">${u.tags.map(t => `<span class="chip sm" style="--c:${TAGS[t].col}">${TAGS[t].ic} ${TAGS[t].n}</span>`).join('')}</span>` + u.tags.map(famLine10).join('') : '') +
      (u.tech && up.tech && up.tech !== u.id ? `<span class="cset warn">Sustituye a ${TECH_NAMES[up.tech]}</span>` : '') +
      (!u.minor && u.stk && u.max > 1 ? `<span class="cstk">⬆ ${lv ? 'Esta copia' : 'Si la repites'}: ${u.stk}</span>` : '') +
      (u.minor ? (lv ? `<span class="lvl">Llevas ×${lv}</span>` : '') : u.max > 1 && u.max < 99 ? `<span class="lvl">Nivel ${lv + 1} / ${u.max}</span>` : '');
    b.addEventListener('click', () => chooseUpgrade(i));
    b.addEventListener('pointerenter', () => play('cursor')); b.addEventListener('focus', () => play('cursor'));
    cardsEl.appendChild(b);
  });
  const fams = TAG_KEYS.filter(t => offer.some(u => (u.tags || []).includes(t)));
  upBonus10.innerHTML = fams.map(t => { const n = tagCnt[t] || 0, on = n >= 3, B = BR10[t], T = TAGS[t];
    return `<div class="fb10${on ? ' on' : ''}" style="--c:${T.col}"><b>${T.ic} ${T.n} ${Math.min(3, n)}/3${on ? ' ✔' : ''}</b> · Bonus: ${T.bonus}` +
      (B ? ` <i>· Especial de rama: ${B.ic} ${B.name}${on ? (lvl(B.id) ? ' (lo tienes)' : ' — ¡ya puede salir!') : ' (con 3)'}</i>` : '') + `</div>`; }).join('');
}
const _dealCards10 = dealCards;
dealCards = function(){
  DEAL10 = true; try { _dealCards10(); } finally { DEAL10 = false; }
  while (P10.force.length){ const t = P10.force.shift(), B = BR10[t], u = B && UPGRADES.find(x => x.id === B.id);
    if (!u || !setOn(t) || lvl(u.id) >= u.max || offer.includes(u)) continue;
    let k = offer.length - 1; while (k > 0 && (offer[k].r === 'leyenda' || offer[k].branch)) k--; offer[k] = u; break; }
  try { renderCards10(); } catch (err) { console.error(err); }
};

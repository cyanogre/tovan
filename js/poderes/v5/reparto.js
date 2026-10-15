'use strict';
/* ---------- Desbloqueo gradual ---------- */
const PW_BASE = new Set(['dmg', 'crit', 'hp', 'potion', 'speed', 'armor', 'meter', 'life', 'slam', 'fire', 'quake', 'orb', 'fireEdge', 'frost', 'storm', 'express', 'magnet', 'cafe']);
const PW = {};
const pwRule = (id, c, t, p) => { PW[id] = { c, t, p }; };
const bossN = () => Object.keys(meta.bosses || {}).length, beat = t => !!(meta.bosses || {})[t];
const R = (k, n, t) => [() => st5(k) >= n, t, () => [st5(k), n]];
[
  ['spin', () => (meta.runs || 0) >= 2, 'Juega 2 partidas.', () => [meta.runs || 0, 2]],
  ['after', () => (meta.best || 0) >= 3, 'Llega a la oleada 3.', () => [meta.best || 0, 3]],
  ['static', ...R('rolls', 60, 'Rueda 60 veces.')],
  ['frenzy', () => (meta.bestCombo || 0) >= 50, 'Haz un combo de 50.', () => [meta.bestCombo || 0, 50]],
  ['glacial', ...R('frozen', 20, 'Congela a 20 enemigos.')],
  ['meterKill', () => (meta.kills || 0) >= 150, 'Derrota a 150 enemigos en total.', () => [meta.kills || 0, 150]],
  ['springs', ...R('jumps', 80, 'Salta 80 veces.')],
  ['lucky', ...R('crits', 150, 'Asesta 150 golpes críticos.')],
  ['reflect', ...R('k_sentinel', 40, 'Derrota a 40 centinelas.')],
  ['perfect', ...R('dodges', 25, 'Esquiva 25 golpes rodando.')],
  ['returns', ...R('dodges', 45, 'Esquiva 45 golpes rodando.')],
  ['ghost', ...R('dodges', 110, 'Esquiva 110 golpes rodando.')],
  ['chain', ...R('reactions', 15, 'Provoca 15 reacciones elementales.')],
  ['boom', () => (meta.kills || 0) >= 350, 'Derrota a 350 enemigos en total.', () => [meta.kills || 0, 350]],
  ['poison', () => (meta.best || 0) >= 6, 'Llega al Santuario de los Cerezos (oleada 6).', () => [meta.best || 0, 6]],
  ['venomBlade', ...R('poisoned', 120, 'Envenena a 120 enemigos.')],
  ['plague', ...R('poisoned', 350, 'Envenena a 350 enemigos.')],
  ['parcel', () => beat('boss'), 'Derrota al Guardián de las Ruinas.'],
  ['signature', ...R('crits', 500, 'Asesta 500 golpes críticos.')],
  ['thorns', ...R('hurts', 120, 'Aprende a las malas: recibe 120 golpes.')],
  ['berserk', ...R('lowclear', 1, 'Supera una oleada con menos del 20 % de PV.')],
  ['fine', ...R('lowclear', 2, 'Supera 2 oleadas con menos del 20 % de PV.')],
  ['phoenix', ...R('lowclear', 5, 'Supera 5 oleadas con menos del 20 % de PV.')],
  ['secondWind', () => (meta.runs || 0) >= 6, 'Juega 6 partidas.', () => [meta.runs || 0, 6]],
  ['lumen', () => (meta.runs || 0) >= 4, 'Juega 4 partidas.', () => [meta.runs || 0, 4]],
  ['orbit', () => (meta.runs || 0) >= 9, 'Juega 9 partidas.', () => [meta.runs || 0, 9]],
  ['siesta', () => !!meta.ach.idle20, 'Logro «Paciencia infinita».'],
  ['bananas', ...R('rolls', 220, 'Rueda 220 veces.')],
  ['domino', () => !!meta.ach.multi5, 'Derrota a 5 enemigos de un solo golpe.'],
  ['frostArmor', ...R('frozen', 70, 'Congela a 70 enemigos.')],
  ['shards', ...R('frozen', 50, 'Congela a 50 enemigos.')],
  ['zero', ...R('frozen', 300, 'Congela a 300 enemigos.')],
  ['blizzard', ...R('frozen', 160, 'Congela a 160 enemigos.')],
  ['pyre', ...R('burned', 100, 'Quema a 100 enemigos.')],
  ['meteor', ...R('burned', 280, 'Quema a 280 enemigos.')],
  ['supernova', ...R('burned', 450, 'Quema a 450 enemigos.')],
  ['pogo', ...R('diveK', 30, 'Derrota a 30 enemigos con picados.')],
  ['overcharge', ...R('chargeMax', 30, 'Suelta 30 ataques cargados al máximo.')],
  ['dashTrail', () => beat('dragon'), 'Derrota a Ryūjin.'],
  ['prism', () => beat('dragon'), 'Derrota a Ryūjin.'],
  ['thunder', () => (meta.best || 0) >= 11, 'Llega a la Cumbre Nevada (oleada 11).', () => [meta.best || 0, 11]],
  ['tempest', () => beat('skeleton'), 'Derrota a Gashadokuro.'],
  ['bigSpecial', ...R('specials', 25, 'Usa el especial 25 veces.')],
  ['kame', ...R('specials', 12, 'Usa el especial 12 veces.')],
  ['world', ...R('specials', 40, 'Usa el especial 40 veces.')],
  ['genki', ...R('specials', 70, 'Usa el especial 70 veces.')],
  ['comboShield', () => (meta.bestCombo || 0) >= 100, 'Haz un combo de 100.', () => [meta.bestCombo || 0, 100]],
  ['tracking', ...R('elites', 25, 'Derrota a 25 enemigos de élite.')],
  ['omae', ...R('elites', 12, 'Derrota a 12 enemigos de élite.')],
  ['glassCannon', () => (meta.best || 0) >= 16, 'Llega al Canal X (oleada 16).', () => [meta.best || 0, 16]],
  ['super', () => (meta.best || 0) >= 14, 'Llega a la oleada 14.', () => [meta.best || 0, 14]],
  ['homing', () => (meta.best || 0) >= 8, 'Llega a la oleada 8.', () => [meta.best || 0, 8]],
  ['stonks', () => beat('star'), 'Derrota a Míster Confianza.'],
  ['pinata', () => bossN() >= 3, 'Derrota a 3 jefes distintos.', () => [bossN(), 3]],
  ['midas', () => st5('frag') >= 900, 'Gana 900 fragmentos en total.', () => [st5('frag'), 900]],
  ['bulletTime', () => beat('teapot'), 'Derrota a la Tetera de Utah.'],
  ['truck', () => beat('dragon'), 'Derrota a Ryūjin, el dragón.'],
  ['note', () => beat('sixeyes'), 'Derrota al de los Seis Ojos.'],
  ['clones', () => beat('star') && beat('sixeyes'), 'Derrota a Míster Confianza y al de los Seis Ojos.'],
  ['mirror', () => Object.keys(meta.syn || {}).length >= 4, 'Descubre 4 sinergias.', () => [Object.keys(meta.syn || {}).length, 4]],
  ['echo', () => Object.keys(meta.syn || {}).length >= 9, 'Descubre 9 sinergias.', () => [Object.keys(meta.syn || {}).length, 9]],
  ['giant', ...R('k_brute', 50, 'Derrota a 50 brutos de piedra.')],
  ['vampOrbs', ...R('k_imp', 250, 'Derrota a 250 diablillos.')],
  ['feast', () => (meta.kills || 0) >= 1200, 'Derrota a 1.200 enemigos en total.', () => [meta.kills || 0, 1200]],
  ['blackhole', () => beat('error'), 'Derrota a ERROR 404.'],
  ['avatar', () => Object.keys(meta.reacts || {}).length >= 3 && Object.keys(meta.syn || {}).length >= 15, 'Descubre las 3 reacciones y 15 sinergias.', () => [Object.keys(meta.syn || {}).length, 15]],
  ['deliveryGod', () => (meta.clears || 0) >= 1, 'Termina el juego (consigue un final).']
].forEach(([id, c, t, p]) => pwRule(id, c, t, p));
const pwOn = id => PW_BASE.has(id) || !PW[id] || !!pwStore()[id] || pwFam10(id);
function pwToast(list){
  if (!list.length) return;
  const el = document.createElement('div'); el.className = 'win toast pw';
  const u = list[0];
  el.innerHTML = list.length === 1 ? `<span class="ti">${u.ic}</span><div><div class="tt">¡Nuevo poder desbloqueado!</div><div class="tn">${u.name}</div><div class="tr">Ya puede salirte en las cartas</div></div>`
    : `<span class="ti">🃏</span><div><div class="tt">¡${list.length} poderes nuevos!</div><div class="tn">${list.slice(0, 3).map(x => x.name).join(', ')}${list.length > 3 ? '…' : ''}</div><div class="tr">Míralos en «Poderes»</div></div>`;
  toastBox.appendChild(el); play('achieve'); setTimeout(() => el.classList.add('out'), 4600); setTimeout(() => el.remove(), 5200);
}
function checkPowers(){
  const got = [];
  for (const [id, r] of Object.entries(PW)){ if (pwStore()[id]) continue; let ok = false; try { ok = r.c(); } catch (err) {} if (!ok) continue;
    pwStore()[id] = Date.now(); (meta.pwNew || (meta.pwNew = {}))[id] = 1; const u = UPGRADES.find(x => x.id === id); if (u){ got.push(u); if (gameState === 'play') P5.newRun.push(u.name); } }
  if (got.length){ saveMeta(); pwToast(got); refreshTitleMenu(); }
}

/* ---------- Reparto de cartas ---------- */
dealCards = function(){
  const cw = curW();
  const avail = UPGRADES.filter(u => !u.minor && (taken[u.id] || 0) < u.max && (!u.req || u.req()) && pwOn(u.id) && (!u.w || u.w === cw) && (!u.useful || u.useful()));
  offer = [];
  const nCards = 3 + ml('choice');
  if (forceLegend){ forceLegend = false; const lg = avail.filter(u => u.r === 'leyenda'), alt = lg.length ? lg : avail.filter(u => u.r === 'epica'); if (alt.length) offer.push(alt[Math.floor(rnd() * alt.length)]); }
  const newLeg = avail.filter(u => u.r === 'leyenda' && !shownLeg.has(u.id) && !offer.includes(u));
  if (newLeg.length && offer.length < nCards) offer.push(newLeg[Math.floor(rnd() * newLeg.length)]);
  // una carta de arma de vez en cuando, si la hay
  const wcards = avail.filter(u => u.w && !offer.includes(u)); if (wcards.length && offer.length < nCards && rnd() < 0.35) offer.push(wcards[Math.floor(rnd() * wcards.length)]);
  while (offer.length < nCards && offer.length < avail.length){
    const cands = avail.filter(u => !offer.includes(u)), tot = cands.reduce((s, u) => s + weightOf(u), 0);
    let r = rnd() * tot; for (const u of cands){ r -= weightOf(u); if (r <= 0){ offer.push(u); break; } }
    if (r > 0 && cands.length) offer.push(cands[cands.length - 1]);
  }
  if (offer.length < nCards){ const ms = MINORS.slice(); for (let i = ms.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [ms[i], ms[j]] = [ms[j], ms[i]]; }
    for (const m of ms){ if (offer.length >= nCards) break; offer.push(m); } }
  for (const u of offer) if (u.r === 'leyenda') shownLeg.add(u.id);
  cardsEl.innerHTML = '';
  offer.forEach((u, i) => {
    const b = document.createElement('button'); b.className = 'win card r-' + u.r + (u.w ? ' wcard' : ''); b.style.animationDelay = (i * 0.07) + 's';
    const lv = taken[u.id] || 0;
    const completes = (u.tags || []).filter(t => (tagCnt[t] || 0) === 2);
    const fresh = meta.pwNew && meta.pwNew[u.id];
    b.innerHTML = `<span class="key">${i + 1}</span><span class="cic">${u.ic}</span><span class="rar" style="color:${RAR[u.r][1]}">${u.w ? '⚔ ' + (cosName('weapon', u.w).split(' ').slice(1).join(' ')) : RAR[u.r][0]}${fresh ? ' <b class="cnew">¡NUEVA!</b>' : ''}</span>` +
      `<span class="cname">${u.name}</span><span class="cdesc">${u.desc}</span>` +
      ((u.tags || []).length ? `<span class="ctags">${u.tags.map(t => `<span class="chip sm" style="--c:${TAGS[t].col}">${TAGS[t].ic} ${TAGS[t].n}</span>`).join('')}</span>` : '') +
      (completes.length ? `<span class="cset">¡Activa el bonus de ${completes.map(t => TAGS[t].n).join(' y ')}!</span>` : '') +
      (u.tech && up.tech && up.tech !== u.id ? `<span class="cset warn">Sustituye a ${TECH_NAMES[up.tech]}</span>` : '') +
      (u.minor ? (lv ? `<span class="lvl">Llevas ×${lv}</span>` : '') : u.max > 1 && u.max < 99 ? `<span class="lvl">Nivel ${lv + 1} / ${u.max}</span>` : '');
    b.addEventListener('click', () => chooseUpgrade(i));
    b.addEventListener('pointerenter', () => play('cursor')); b.addEventListener('focus', () => play('cursor'));
    cardsEl.appendChild(b);
  });
  rerollBtn.hidden = rerolls <= 0; rerollBtn.textContent = `↻ Relanzar (${rerolls})`;
  document.getElementById('upBuild').innerHTML = chipsHTML() || '<span class="dim">Elige tu primera mejora: las familias con 3 cartas activan un bonus</span>';
  if (offer.some(u => u.r === 'leyenda')) play('legend');
  if (offer.every(u => u.minor)) barkOnce('minors', 'Ya no me queda nada en el almacén. Toma, un uno por ciento. Ni las gracias.');
};
const _chooseUpgrade5 = chooseUpgrade;
chooseUpgrade = function(i){
  const u = offer[i]; if (u && meta.pwNew && meta.pwNew[u.id]){ delete meta.pwNew[u.id]; }
  if (u && gameState === 'upgrade') stat('picks');
  _chooseUpgrade5(i);
};

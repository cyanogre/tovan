'use strict';
/* ---------- Vestidor nuevo ---------- */
let wardSel = null;
const statBar = (n) => `<i>${[1, 2, 3, 4, 5].map(k => `<b class="${k <= n ? 'f' : ''}"></b>`).join('')}</i>`;
function wardInfoHTML(cat, id){
  const it = COS[cat].find(c => c[0] === id); if (!it) return '';
  const ok = cosUnlocked(cat, id), on = meta.cos[cat] === id, src = cosSource(cat, id), pow = cosPow(cat, id);
  const st = on ? '<span class="ok">✔ Equipado</span>' : ok ? 'Disponible · pulsa para equipar' : `🔒 ${src && !src.secret ? 'Logro: ' + src.name : 'Logro secreto'}`;
  let html = `<div class="bi">${ok ? it[2] : '🔒'}</div><div class="bn">${ok ? it[1] : '???'}</div><div class="bs">${st}</div>`;
  if (cat === 'weapon' && WSTYLE[id]){ const W = WSTYLE[id];
    html += `<div class="bp"><b>Estilo ${W.style}.</b> ${W.extra}</div><div class="bc">Combo: ${W.combo}</div>`;
    html += `<div class="wstats"><span>Daño</span>${statBar(W.dmg)}<span>Velocidad</span>${statBar(W.spd)}<span>Alcance</span>${statBar(W.rng)}<span>Movilidad</span>${statBar(W.mov)}</div>`;
    if (pow) html += `<div class="bp2">⚡ ${pow}</div>`;
  } else html += `<div class="bp">${pow ? '⚡ ' + pow : cat === 'title' ? 'Sin poder. Solo para fardar.' : 'Sin efecto especial.'}</div>`;
  return html;
}
renderWard = function(){
  const slots = document.getElementById('wardSlots');
  if (slots) slots.innerHTML = COS_CATS.map(([k, n]) => { const it = COS[k].find(c => c[0] === meta.cos[k]);
    return `<button class="wslot${k === wardCat ? ' on' : ''}" data-k="${k}" title="${n}"><span class="wsi">${k === 'title' ? '🏷️' : it ? it[2] : '·'}</span><span class="wsl">${n}</span></button>`; }).join('');
  const list = document.getElementById('wardList');
  list.innerHTML = COS[wardCat].map(([id, name, ic]) => { const ok = cosUnlocked(wardCat, id), on = meta.cos[wardCat] === id;
    return `<button class="win witem${on ? ' on' : ''}${ok ? '' : ' lock'}${wardSel === id ? ' sel' : ''}" data-id="${id}"><span class="wic">${ok ? ic : '🔒'}</span><span class="wn">${ok ? name : '???'}</span>${on ? '<span class="weq">✔</span>' : ''}</button>`; }).join('');
  const info = document.getElementById('wardInfo'), showId = wardSel && COS[wardCat].some(c => c[0] === wardSel) ? wardSel : meta.cos[wardCat];
  if (info) info.innerHTML = wardInfoHTML(wardCat, showId);
  const cnt = document.getElementById('wardCount'); if (cnt){ let t = 0, g = 0; for (const c of Object.keys(COS)) for (const [i] of COS[c]){ t++; if (cosUnlocked(c, i)) g++; } cnt.textContent = `${g}/${t} desbloqueados`; }
  if (slots) slots.querySelectorAll('.wslot').forEach(b => b.addEventListener('click', () => { wardCat = b.dataset.k; wardSel = null; play('cursor'); renderWard(); focusWard(); }));
  list.querySelectorAll('.witem').forEach(b => {
    const show = () => { wardSel = b.dataset.id; if (info) info.innerHTML = wardInfoHTML(wardCat, wardSel); list.querySelectorAll('.witem').forEach(x => x.classList.toggle('sel', x === b)); };
    b.addEventListener('pointerenter', show); b.addEventListener('focus', show);
    b.addEventListener('click', () => { const id = b.dataset.id; if (!cosUnlocked(wardCat, id)){ play('cursor'); return; }
      meta.cos[wardCat] = id; saveMeta(); applyCosmetics(false); play('buy');
      if (wardCat === 'dance'){ celebT = 2.2; if (id === 'wave') waveT = 1.8; }
      if (wardCat === 'glasses' && id === 'pixel') glassDropT = 0.7;
      if (wardCat === 'sound') play('hit');
      wardSel = id; renderWard(); focusWard(); });
  });
};
function focusWard(){ setTimeout(() => { const l = document.getElementById('wardList'); const b = l.querySelector('.witem.sel') || l.querySelector('.witem.on') || l.querySelector('.witem'); if (b) b.focus({ preventScroll: false }); }, 30); }
function wardMove(dx, dy){
  const items = [...document.querySelectorAll('#wardList .witem')]; if (!items.length) return;
  let i = items.indexOf(document.activeElement); if (i < 0) i = 0;
  const top0 = items[0].offsetTop, cols = Math.max(1, items.filter(b => b.offsetTop === top0).length);
  i = clamp(i + dx + dy * cols, 0, items.length - 1); items[i].focus(); play('cursor');
}
function wardCatStep(d){ const i = COS_CATS.findIndex(c => c[0] === wardCat); wardCat = COS_CATS[(i + d + COS_CATS.length) % COS_CATS.length][0]; wardSel = null; play('cursor'); renderWard(); focusWard(); }
const _openWard = openWard;
openWard = function(from){ _openWard(from); focusWard(); };

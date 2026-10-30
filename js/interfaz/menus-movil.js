'use strict';
/* =====================================================================
   v13.4 · menús para móvil: menos scroll, lo importante a mano
   ===================================================================== */
const MOB13 = '(max-width: 720px), (max-height: 520px)';
const mobQ13 = matchMedia(MOB13);
const isMob13 = () => mobQ13.matches;
/* (estilos de esta parte: css/menus-movil.css) */

/* ---------- Cartas: cabecera con botón de detalles y resumen compacto ---------- */
const upScr13 = document.getElementById('upScr');
const upHead13 = document.createElement('div'); upHead13.id = 'upHead13';
const upTitle13 = upScr13 ? upScr13.querySelector('.uptitle') : null;
if (upScr13 && upTitle13){ upScr13.insertBefore(upHead13, upTitle13); upHead13.appendChild(upTitle13); }
const detBtn13 = document.createElement('button'); detBtn13.className = 'win btn sm'; detBtn13.id = 'detBtn13'; upHead13.appendChild(detBtn13);
let det13 = false; try { det13 = localStorage.getItem('tovan-det13') === '1'; } catch (err) {}
function detSync13(){ if (upScr13) upScr13.classList.toggle('full13', det13); detBtn13.textContent = det13 ? '− Menos' : '+ Detalles'; }
detBtn13.addEventListener('click', ev => { ev.stopPropagation(); det13 = !det13; try { localStorage.setItem('tovan-det13', det13 ? '1' : '0'); } catch (err) {} detSync13(); play('cursor'); });
detSync13();
const _renderCards13m = renderCards10;
renderCards10 = function(){ _renderCards13m();
  try { [...cardsEl.children].forEach((b, i) => { const u = offer[i]; if (!u || b.querySelector('.cmini')) return;
      const lv = taken[u.id] || 0, out = [];
      for (const t of (u.tags || [])){ const T = TAGS[t]; if (!T) continue; const n = tagCnt[t] || 0;
        if (n >= 3) out.push(`<span style="--c:${T.col}">${T.ic} ✔</span>`);
        else if (n === 2) out.push(`<span class="go" style="--c:${T.col}">${T.ic} ¡Bonus!</span>`);
        else out.push(`<span style="--c:${T.col}">${T.ic} ${n + 1}/3</span>`); }
      for (const s of b.querySelectorAll('.csyn.go')){ const nm = s.querySelector('b'); out.push(`<span class="go" style="--c:#5affb0">⚗️ ${nm ? nm.textContent : 'Sinergia'}</span>`); }
      if (u.max > 1 && u.max < 99 && !u.minor) out.push(`<span style="--c:#ffd970">Nv ${lv + 1}/${u.max}</span>`);
      if (out.length) b.insertAdjacentHTML('beforeend', `<span class="cmini">${out.join('')}</span>`); }); } catch (err) { console.error(err); }
};

/* ---------- Poderes y logros: rejilla de iconos con ficha ---------- */
function grid13(listId){
  const list = document.getElementById(listId); if (!list) return;
  let wrap = list.parentNode.classList.contains('gw13') ? list.parentNode : null;
  if (!wrap){ wrap = document.createElement('div'); wrap.className = 'gw13'; list.parentNode.insertBefore(wrap, list); wrap.appendChild(list); }
  let det = wrap.querySelector(':scope > .det13');
  if (!det){ det = document.createElement('div'); det.className = 'det13'; wrap.insertBefore(det, list); }
  if (!isMob13()){ list.classList.remove('g13'); det.innerHTML = ''; return; }
  list.classList.add('g13');
  const items = [...list.querySelectorAll('.ach')];
  items.forEach(it => { if (it.querySelector('.cnew')) it.classList.add('new13'); });
  if (!list.dataset.g13){ list.dataset.g13 = '1';
    list.addEventListener('click', ev => { if (!list.classList.contains('g13')) return; const it = ev.target.closest('.ach'); if (!it || !list.contains(it)) return;
      list.querySelectorAll('.sel13').forEach(x => x.classList.remove('sel13')); it.classList.add('sel13');
      const c = it.cloneNode(true); c.classList.remove('sel13', 'new13'); const d = list.parentNode.querySelector(':scope > .det13'); if (d) { d.innerHTML = ''; d.appendChild(c); } play('cursor'); }); }
  const first = items.find(x => x.classList.contains('new13')) || null;
  if (first){ first.classList.add('sel13'); const c = first.cloneNode(true); c.classList.remove('sel13', 'new13'); det.innerHTML = ''; det.appendChild(c); }
  else det.innerHTML = `<div class="hint13">Toca un icono para ver qué hace${listId === 'achList' ? ' y qué premio da' : ' y cómo se consigue'}.</div>`;
}
const _renderPw13 = renderPw; renderPw = function(){ _renderPw13(); try { grid13('pwList'); } catch (err) { console.error(err); } };
const _renderAch13 = renderAch; renderAch = function(){ _renderAch13(); try { grid13('achList'); } catch (err) { console.error(err); } };
mobQ13.addEventListener('change', () => { try {
  if (!pwScr.hidden) renderPw(); const a = document.getElementById('achScr'); if (a && !a.hidden) renderAch();
  if (upScr13 && !upScr13.hidden) renderCards10(); } catch (err) {} });

/* ---------- Avisos: en móvil duran menos y se quitan con un toque ---------- */
const toastBox13 = document.getElementById('toasts');
if (toastBox13){
  new MutationObserver(ms => { if (!isMob13()) return;
    for (const m of ms) for (const el of m.addedNodes){ if (!(el instanceof HTMLElement) || !el.classList.contains('toast') || el.dataset.m13) continue;
      el.dataset.m13 = '1';
      const bye = () => { el.classList.add('out'); setTimeout(() => el.remove(), 380); };
      setTimeout(bye, 3300);
      el.addEventListener('pointerdown', ev => { ev.stopPropagation(); bye(); }); } }).observe(toastBox13, { childList: true });
}

/* ---------- Vestidor: nombre de la ranura que estás mirando ---------- */
const _renderWard13m = renderWard;
renderWard = function(){ _renderWard13m();
  try { const slots = document.getElementById('wardSlots'); if (!slots) return;
    let cap = document.getElementById('wslCap13');
    if (!cap){ cap = document.createElement('div'); cap.id = 'wslCap13'; slots.after(cap); }
    const c = COS_CATS.find(x => x[0] === wardCat); cap.textContent = c ? '▾ ' + c[1] : ''; } catch (err) { console.error(err); }
};

/* ---------- Pausa: las reacciones sin descubrir, en una sola línea ---------- */
const _buildHTML13m = buildHTML;
buildHTML = function(){ const h = _buildHTML13m(); if (!isMob13()) return h;
  const re = /<div class="rx unk">[\s\S]*?<\/div>/g, n = (h.match(re) || []).length; if (n < 2) return h;
  let first = true;
  return h.replace(re, () => { if (!first) return ''; first = false; return `<div class="rx unk">??? ×${n} <span>combina elementos para descubrirlas</span></div>`; });
};

/* ---------- Opciones: la lista se desplaza (en el móvil en horizontal no cabe) ---------- */
// mientras quede algo por debajo, el pie de la lista se funde (#menu.opcMas): si no, parecía que se acababa ahí
const opcLista13 = document.getElementById('menuList'), opcMenu13 = document.getElementById('menu');
function opcMas13(){ opcMenu13.classList.toggle('opcMas', opcLista13.scrollTop + opcLista13.clientHeight < opcLista13.scrollHeight - 2); }
opcLista13.addEventListener('scroll', opcMas13, { passive: true }); addEventListener('resize', opcMas13);
// (al abrirlo con su cabecera también se ponen al día los valores: antes solo lo hacía el botón «Opciones»)
let opcAbierto13 = false;
new MutationObserver(() => { const ab = !opcMenu13.classList.contains('closed'); if (ab && !opcAbierto13 && typeof refreshMenu === 'function') refreshMenu(); opcAbierto13 = ab; opcMas13(); })
  .observe(opcMenu13, { attributes: true, attributeFilter: ['class'] });
new MutationObserver(opcMas13).observe(opcLista13, { childList: true });

'use strict';
/* ---------- Logros algo más difíciles ---------- */
const HARD_ACH = { oni50: ['oni', 75, 'Derrota a 75 oni.'], freeze100: ['frozen', 150, 'Congela a 150 enemigos.'], burn200: ['burned', 250, 'Prende fuego a 250 enemigos.'],
  frag1000: ['frag', 1500, 'Gana 1500 fragmentos en total.'], roll300: ['rolls', 400, 'Rueda 400 veces.'] };
for (const [id, [k, n, d]] of Object.entries(HARD_ACH)){ const a = ACH.find(x => x.id === id); if (a){ a.desc = d; a.prog = () => [st5(k), n]; } }
const _unlock5 = unlock;
unlock = function(id){ const h = HARD_ACH[id]; if (h && st5(h[0]) < h[1]) return; _unlock5(id); };
function hardAchCheck(){ for (const [id, [k, n]] of Object.entries(HARD_ACH)) if (!meta.ach[id] && st5(k) >= n) unlock(id); }
// el santuario: lo más potente cuesta algo más
for (const it of SHRINE){
  if (it.id === 'revive'){ it.cost = l => 1200 + l * 1200; it.desc = 'Al caer te levantas con un tercio de PV. Una vez por partida y nivel.'; }
  if (it.id === 'vit') it.cost = l => 60 + l * 70;
  if (it.id === 'choice') it.cost = () => 420;
  if (it.id === 'kit') it.cost = () => 500;
  if (it.id === 'luck') it.cost = l => 75 + l * 75;
}

/* ---------- Pantalla «Poderes» ---------- */
const pwScr = document.createElement('div'); pwScr.className = 'overlay'; pwScr.id = 'pwScr'; pwScr.hidden = true;
pwScr.innerHTML = '<div class="win panel achp"><h2>Poderes</h2><p id="pwCount"></p><div id="pwTabs"></div><div id="pwList"></div><button class="win btn" id="pwBack">Volver</button></div>';
document.body.appendChild(pwScr);
let pwTab = 'gen';
const PW_TABS = [['gen', '🃏 Generales'], ['arm', '⚔ De arma'], ['min', '➕ Menores']];
function pwCondHTML(id){
  const r = PW[id]; if (!r) return '';
  const p = r.p ? r.p() : null;
  return `<div class="ad lock">🔒 ${r.t}</div>` + (p ? `<div class="ap"><span class="abar sm"><i style="width:${Math.min(100, p[0] / p[1] * 100)}%"></i></span>${Math.min(p[0], p[1])}/${p[1]}</div>` : '');
}
function pwItemHTML(u){
  const ok = pwOn(u.id), fresh = meta.pwNew && meta.pwNew[u.id];
  return `<div class="ach pwi r-${u.r}${ok ? ' ok' : ''}"><span class="aic">${ok ? u.ic : '🔒'}</span><div class="abody"><div class="an">${ok ? u.name : '???'}${fresh ? ' <b class="cnew">¡NUEVO!</b>' : ''}</div>` +
    `<div class="pwr" style="color:${RAR[u.r][1]}">${RAR[u.r][0]}${(u.tags || []).length ? ' · ' + u.tags.map(t => TAGS[t].ic + ' ' + TAGS[t].n).join(' · ') : ''}</div>` +
    (ok ? `<div class="ad">${u.desc}</div>` : pwCondHTML(u.id)) + `</div></div>`;
}
function renderPw(){
  const gen = UPGRADES.filter(u => !u.minor && !u.w), arm = UPGRADES.filter(u => u.w);
  const all = gen.concat(arm), got = all.filter(u => pwOn(u.id)).length;
  document.getElementById('pwCount').innerHTML = `${got} / ${all.length} desbloqueados<span class="abar"><i style="width:${got / all.length * 100}%"></i></span>`;
  document.getElementById('pwTabs').innerHTML = PW_TABS.map(([k, n]) => `<button class="win ptab${k === pwTab ? ' on' : ''}" data-k="${k}">${n}</button>`).join('');
  document.getElementById('pwTabs').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { pwTab = b.dataset.k; play('cursor'); renderPw(); }));
  const list = document.getElementById('pwList');
  if (pwTab === 'gen') list.innerHTML = gen.slice().sort((a, b) => (pwOn(b.id) - pwOn(a.id))).map(pwItemHTML).join('');
  else if (pwTab === 'arm') list.innerHTML = COS.weapon.map(([w, n, ic]) => { const us = arm.filter(u => u.w === w); if (!us.length) return '';
    return `<h3 class="pwh">${ic} ${n}${cosUnlocked('weapon', w) ? '' : ' <span class="dim">(arma bloqueada)</span>'} · <span class="dim">${wkOf(w)} enemigos derrotados con ella</span></h3>` + us.map(pwItemHTML).join(''); }).join('');
  else list.innerHTML = `<p class="pwnote">Cuando ya no queda ninguna carta que te sume algo, salen estas. Son poca cosa, pero se acumulan sin límite.</p>` +
    MINORS.map(u => `<div class="ach ok pwi r-menor"><span class="aic">${u.ic}</span><div class="abody"><div class="an">${u.name}</div><div class="ad">${u.desc}</div></div></div>`).join('');
}
let pwFrom = 'title';
function openPw(from){ pwFrom = from; checkPowers(); renderPw(); pwScr.hidden = false; titleScr.hidden = true; overScr.hidden = true; play('confirm');
  setTimeout(() => { const b = document.getElementById('pwBack'); if (b) b.focus({ preventScroll: true }); }, 40); }
function closePw(){ pwScr.hidden = true; (pwFrom === 'over' ? overScr : titleScr).hidden = false; meta.pwNew = {}; saveMeta(); refreshTitleMenu(); play('cursor'); if (pwFrom === 'title') focusTitle(); }
document.getElementById('pwBack').addEventListener('click', closePw);
addEventListener('keydown', e => { if (!pwScr.hidden && (e.code === 'Escape' || e.code === 'Backspace')){ e.preventDefault(); closePw(); } }, true);
{ const ach = document.getElementById('achBtn');
  if (ach){ const b = document.createElement('button'); b.className = 'win tbtn'; b.id = 'pwBtn';
    b.innerHTML = '<span class="ti">🃏</span><span class="tl">Poderes</span><span class="td" id="tdPw"></span>'; ach.parentNode.insertBefore(b, ach); b.addEventListener('click', () => openPw('title')); } }
const _refreshTitleMenu5 = refreshTitleMenu;
refreshTitleMenu = function(){ _refreshTitleMenu5(); const el = document.getElementById('tdPw'); if (!el) return;
  const all = UPGRADES.filter(u => !u.minor), got = all.filter(u => pwOn(u.id)).length, nw = Object.keys(meta.pwNew || {}).length;
  el.innerHTML = `${got}/${all.length}${nw ? ` <b class="cnew">+${nw}</b>` : ''}`; };
const _showOver5 = showOver;
showOver = function(){ _showOver5(); checkPowers();
  if (P5.newRun.length){ const s = document.getElementById('overStats'); if (s) s.insertAdjacentHTML('beforeend', `<div class="ups pwnew"><b>Poderes nuevos</b>${P5.newRun.join(', ')}</div>`); } };

/* (estilos de esta parte: css/pantalla-poderes.css) */
Object.assign(SFX, { stamp: () => { noise({ dur: 0.08, vol: 0.3, f0: 900, q: 0.8, rv: 0.1 }); tone({ type: 'square', f0: 180, f1: 90, dur: 0.1, vol: 0.12, rv: 0.1 }); } });

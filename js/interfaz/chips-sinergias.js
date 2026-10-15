'use strict';
/* ---------- Interfaz de sinergias ---------- */
const tagsEl = document.getElementById('tags'), comboBox = document.getElementById('comboBox'), comboNumEl = document.getElementById('comboNum');
const comboWordEl = document.getElementById('comboWord'), comboTimeEl = document.getElementById('comboTime');
let comboWordT = 0;
function chipsHTML(extra){
  const all = Object.assign({}, tagCnt); if (extra) for (const t of extra) all[t] = (all[t] || 0) + 1;
  return TAG_KEYS.filter(t => all[t]).map(t => {
    const n = all[t], on = n >= 3;
    return `<span class="chip${on ? ' on' : ''}" style="--c:${TAGS[t].col}" title="${TAGS[t].n}: ${TAGS[t].bonus}">${TAGS[t].ic} <span class="tn">${TAGS[t].n}</span> <b>${Math.min(n, 3)}/3</b></span>`;
  }).join('');
}
function renderTagChips(){ tagsEl.innerHTML = chipsHTML(); tagsEl.hidden = !tagsEl.innerHTML || gameState === 'title'; }
function buildHTML(){
  const ups = Object.entries(taken).map(([id, n]) => { const u = UPGRADES.find(x => x.id === id);
    return `<span class="bitem r-${u.r}">${u.ic} ${u.name}${n > 1 ? ` ×${n}` : ''}</span>`; }).join('') || '<span class="dim">Aún sin mejoras</span>';
  const sets = TAG_KEYS.filter(t => setOn(t)).map(t => `<div class="bonus" style="--c:${TAGS[t].col}">${TAGS[t].ic} <b>${TAGS[t].n}</b> · ${TAGS[t].bonus}</div>`).join('');
  const reacts = Object.keys(REACT).map(k => (meta.reacts && meta.reacts[k])
    ? `<div class="rx" style="color:${REACT[k].css}">${REACT[k].name.replace(/[¡!]/g, '')} <span>${reactHint[k]}</span></div>`
    : `<div class="rx unk">??? <span>Combina elementos para descubrirla</span></div>`).join('');
  return `<div class="bsec"><h3>Tu build</h3><div class="blist">${ups}</div></div>` +
    (sets ? `<div class="bsec"><h3>Bonus activos</h3>${sets}</div>` : '') +
    `<div class="bsec"><h3>Reacciones</h3>${reacts}</div>`;
}
const portrait = document.getElementById('portrait');
function drawPortrait(){
  const c = portrait.getContext && portrait.getContext('2d'); if (!c || !faceTex.image) return;
  c.imageSmoothingEnabled = false; c.clearRect(0, 0, 32, 32); c.drawImage(faceTex.image, 0, 0, 32, 32);
}
drawPortrait();

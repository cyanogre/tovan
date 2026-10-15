'use strict';
/* ---------- Porcentaje de juego completado ---------- */
const ALL_BOSSES = ['boss', 'dragon', 'skeleton', 'star', 'teapot', 'error', 'sixeyes', 'finalcat'];
function completion(){
  const endings = Object.keys(meta.endings || {}).length / ENDINGS.length;
  const ach = ACH.filter(a => meta.ach[a.id]).length / ACH.length;
  const bosses = ALL_BOSSES.filter(b => (meta.bosses || {})[b]).length / ALL_BOSSES.length;
  const syn = Math.min(1, Object.keys(meta.syn || {}).length / 30);
  let tot = 0, got = 0; for (const cat of Object.keys(COS)) for (const [id] of COS[cat]){ tot++; if (cosUnlocked(cat, id)) got++; }
  return Math.floor(endings * 35 + ach * 30 + bosses * 15 + syn * 10 + (got / tot) * 10);
}
function refreshPct(){ const el = document.getElementById('pctTxt'); if (el) el.innerHTML = `Juego completado: <b>${completion()} %</b> · Finales ${Object.keys(meta.endings || {}).length}/${ENDINGS.length}`; }

/* ---------- Pantalla de finales ---------- */
const endScr = document.getElementById('endScr');
function openEndings(){
  const got = meta.endings || {};
  document.getElementById('endList').innerHTML = ENDINGS.map((E, i) => { const ok = got[E.id];
    return `<div class="endi${ok ? ' ok' : ''}"><span class="en2">${i + 1}</span><div><div class="et2">${ok ? E.name : '???'} <span class="ety t-${E.type.toLowerCase()}">${E.type}</span></div>
      <div class="ed2">${ok ? E.desc : (E.hint || 'Supera el juego y a ver qué pasa.')}</div></div></div>`; }).join('');
  document.getElementById('endPct').textContent = `Juego completado: ${completion()} %`;
  endScr.hidden = false; titleScr.hidden = true; play('confirm');
}
document.getElementById('endBtn').addEventListener('click', openEndings);
document.getElementById('endScrBack').addEventListener('click', () => { endScr.hidden = true; titleScr.hidden = false; play('cursor'); refreshPct(); });

/* ---------- Borrar datos ---------- */
const wipeEl = document.getElementById('wipeScr');
function askWipe(){ wipeEl.hidden = false; wipeEl.querySelector('.w1').hidden = false; wipeEl.querySelector('.w2').hidden = true; setMenu(false); play('bruteWarn'); }
document.getElementById('wipeNo').addEventListener('click', () => { wipeEl.hidden = true; play('cursor'); });
document.getElementById('wipeNo2').addEventListener('click', () => { wipeEl.hidden = true; play('cursor'); });
document.getElementById('wipeYes').addEventListener('click', () => { wipeEl.querySelector('.w1').hidden = true; wipeEl.querySelector('.w2').hidden = false; play('bruteWarn'); });
document.getElementById('wipeYes2').addEventListener('click', () => {
  try { ['tovan-meta', 'tovan-best', 'tovan-audio'].forEach(k => localStorage.removeItem(k)); } catch (e) {}
  location.reload();
});
STORY['biome_' + FINAL] = [['tovan', 'Esto es… la azotea del anticuario. Donde empezó todo.'], ['lumen', 'El sello nos ha traído de vuelta al mundo real. Aquí vive el Guardián.'],
  ['tovan', '¡Por fin! Le doy el paquete, me firma y a casa.'], ['lumen', 'Tovan. El paquete era yo. Y me has usado para pegar a medio universo.'], ['tovan', '…¿Crees que se enfadará?']];
function drawPhone(c){ drawPortraitImg(c, 'retratos/telefono'); }

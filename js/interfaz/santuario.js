'use strict';
/* ---------- Santuario ---------- */
const shrineScr = document.getElementById('shrineScr'), shrineList = document.getElementById('shrineList');
let shrineFrom = 'title';
function openShrine(from){ shrineFrom = from; renderShrine(); shrineScr.hidden = false; titleScr.hidden = true; overScr.hidden = true; play('confirm');
  setTimeout(() => { const f = shrineList.querySelector('button:not([disabled])') || document.getElementById('shrineBack'); f.focus({ preventScroll: true }); }, 50); }
function closeShrine(){ shrineScr.hidden = true; (shrineFrom === 'over' ? overScr : titleScr).hidden = false; updateBest(); play('cursor');
  document.getElementById('fragGain').querySelector('span') && (document.getElementById('fragGain').querySelector('span').textContent = `(tienes ${meta.frag})`); }
function renderShrine(){
  document.getElementById('fragTotal').textContent = `✦ ${meta.frag} fragmentos`;
  shrineList.innerHTML = '';
  SHRINE.forEach(it => {
    const l = ml(it.id), maxed = l >= it.max, cost = maxed ? 0 : it.cost(l);
    const b = document.createElement('button'); b.className = 'win srow'; b.disabled = maxed || meta.frag < cost;
    b.innerHTML = `<span class="sname">${it.name}</span><span class="spips">${'◆'.repeat(l)}${'◇'.repeat(it.max - l)}</span>` +
      `<span class="sdesc">${it.desc}</span><span class="scost${!maxed && meta.frag < cost ? ' no' : ''}">${maxed ? 'MÁX' : '✦ ' + cost}</span>`;
    b.addEventListener('click', () => { if (maxed || meta.frag < cost) return; meta.frag -= cost; meta.lv[it.id] = l + 1; saveMeta(); if (Object.values(meta.lv).reduce((a, b) => a + b, 0) >= 10) unlock('shrine10'); play('buy'); renderShrine();
      const nb = shrineList.children[SHRINE.indexOf(it)]; if (nb) nb.focus({ preventScroll: true }); });
    b.addEventListener('pointerenter', () => play('cursor'));
    shrineList.appendChild(b);
  });
}

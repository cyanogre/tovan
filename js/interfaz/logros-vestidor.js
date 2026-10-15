'use strict';
/* ---------- Pantallas: logros y vestidor ---------- */
const achScr = document.getElementById('achScr'), wardScr = document.getElementById('wardScr');
let achFrom = 'title', wardCat = 'hat';
function openAch(from){ achFrom = from; renderAch(); achScr.hidden = false; titleScr.hidden = true; overScr.hidden = true; play('confirm'); }
function closeAch(){ achScr.hidden = true; (achFrom === 'over' ? overScr : titleScr).hidden = false; play('cursor'); updateBest(); }
function renderAch(){
  const got = ACH.filter(a => meta.ach[a.id]).length;
  document.getElementById('achCount').innerHTML = `${got} / ${ACH.length}<span class="abar"><i style="width:${got / ACH.length * 100}%"></i></span>`;
  document.getElementById('achList').innerHTML = ACH.map(a => {
    const ok = !!meta.ach[a.id], hid = a.secret && !ok, p = a.prog && !ok ? a.prog() : null;
    return `<div class="ach${ok ? ' ok' : ''}"><span class="aic">${hid ? '❓' : a.ic}</span><div class="abody"><div class="an">${hid ? 'Logro secreto' : a.name}</div>` +
      `<div class="ad">${hid ? 'Nadie sabe cómo se consigue. Ni siquiera Lumen.' : a.desc}</div>` +
      (p ? `<div class="ap"><span class="abar sm"><i style="width:${Math.min(100, p[0] / p[1] * 100)}%"></i></span>${Math.min(p[0], p[1])}/${p[1]}</div>` : '') +
      `<div class="ar">${hid ? '🎁 ???' : '🎁 ' + a.rw.map(([c, id]) => c === 'title' ? `Título «${id}»` : cosName(c, id)).join(' · ')}</div></div></div>`;
  }).join('');
}
function openWard(from){ achFrom = from; renderWard(); wardScr.hidden = false; titleScr.hidden = true; overScr.hidden = true; play('confirm'); }
function closeWard(){ wardScr.hidden = true; (achFrom === 'over' ? overScr : titleScr).hidden = false; play('cursor'); }
function renderWard(){
  document.getElementById('wardTabs').innerHTML = COS_CATS.map(([k, n]) => `<button class="win wtab${k === wardCat ? ' on' : ''}" data-k="${k}">${n}</button>`).join('');
  document.getElementById('wardList').innerHTML = COS[wardCat].map(([id, name, ic]) => {
    const ok = cosUnlocked(wardCat, id), on = meta.cos[wardCat] === id, src = cosSource(wardCat, id);
    return `<button class="win witem${on ? ' on' : ''}" data-id="${id}" ${ok ? '' : 'disabled'}><span class="wic">${ok ? ic : '🔒'}</span><span class="wn">${ok ? name : '???'}</span>` +
      `<span class="wr">${on ? 'Equipado' : ok ? '' : (src && !src.secret ? 'Logro: ' + src.name : 'Logro secreto')}</span>` +
      (cosPow(wardCat, id) ? `<span class="wp">⚡ ${cosPow(wardCat, id)}</span>` : '') + `</button>`;
  }).join('');
  document.querySelectorAll('#wardTabs .wtab').forEach(b => b.addEventListener('click', () => { wardCat = b.dataset.k; play('cursor'); renderWard(); }));
  document.querySelectorAll('#wardList .witem').forEach(b => b.addEventListener('click', () => {
    if (b.disabled) return; meta.cos[wardCat] = b.dataset.id; saveMeta(); applyCosmetics(false); play('buy');
    if (wardCat === 'dance'){ celebT = 2.2; if (b.dataset.id === 'wave') waveT = 1.8; }
    if (wardCat === 'glasses' && b.dataset.id === 'pixel') glassDropT = 0.7;
    if (wardCat === 'sound') play('hit');
    renderWard(); }));
}
document.getElementById('achBtn').addEventListener('click', () => openAch('title'));
document.getElementById('achBtn2').addEventListener('click', () => openAch('over'));
document.getElementById('achBack').addEventListener('click', closeAch);
document.getElementById('wardBtn').addEventListener('click', () => openWard('title'));
document.getElementById('wardBtn2').addEventListener('click', () => openWard('over'));
document.getElementById('wardBack').addEventListener('click', closeWard);
document.getElementById('portrait').addEventListener('click', () => { if (gameState === 'play' && state === 'normal'){ waveT = 1.8; noteWave(); } });

Object.assign(SFX, {
  achieve: () => { seq_([[72, 0.12], [76, 0.12], [79, 0.12], [84, 0.5]], 'square', 0.08, 0.07, 0.5); tone({ type: 'triangle', f0: NOTE(96), dur: 0.8, vol: 0.05, when: 0.3, rv: 0.9 }); },
  honk:  () => { tone({ type: 'square', f0: 330, f1: 300, dur: 0.14, vol: 0.12, rv: 0.1 }); tone({ type: 'square', f0: 262, f1: 250, dur: 0.18, vol: 0.12, when: 0.12, rv: 0.1 }); },
  honkC: () => { SFX.honk(); tone({ type: 'square', f0: 392, f1: 380, dur: 0.2, vol: 0.1, when: 0.28, rv: 0.2 }); },
  quack: () => { tone({ type: 'sawtooth', f0: 620, f1: 380, dur: 0.16, vol: 0.09, rv: 0.1 }); noise({ dur: 0.12, vol: 0.06, f0: 1400, q: 3 }); },
  quackC:() => { SFX.quack(); tone({ type: 'sawtooth', f0: 700, f1: 420, dur: 0.16, vol: 0.09, when: 0.14, rv: 0.2 }); }
});

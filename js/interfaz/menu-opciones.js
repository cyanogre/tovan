'use strict';
/* ---------- Menú de configuración ---------- */
let scanOn = true;
const scanEl = document.getElementById('scan');
const yn = v => (v ? 'Sí' : 'No');
const options = [
  { label: 'Resolución',          get: () => RES[resIdx].label,        act: () => { resIdx = (resIdx + 1) % RES.length; resize(); } },
  { label: 'Temblor de vértices', get: () => yn(shared.uSnap.value),   act: () => { shared.uSnap.value ^= 1; } },
  { label: 'Texturas afines',     get: () => yn(shared.uAffine.value), act: () => { shared.uAffine.value ^= 1; } },
  { label: 'Color 15 bits',       get: () => yn(shared.uDither.value), act: () => { shared.uDither.value ^= 1; } },
  { label: 'Líneas CRT',          get: () => yn(scanOn),               act: () => { scanOn = !scanOn; scanEl.style.display = scanOn ? '' : 'none'; } },
  { label: 'Música',              get: () => yn(musOn),                act: () => { musOn = !musOn; saveAudio(); initAudio(); applyMusVol(); } },
  { label: 'Efectos de sonido',   get: () => yn(sfxOn),                act: () => { sfxOn = !sfxOn; saveAudio(); initAudio(); applyMusVol(); } },
  { label: 'Canciones de jefes',  get: () => { const n = tracksOk(); return n >= 8 ? '8/8 mp3' : n ? `${n} mp3 + propias` : 'Propias'; },  act: () => trackInput.click() },
  { label: 'Borrar datos',        get: () => '⚠',                      act: () => askWipe() }
];
const list = document.getElementById('menuList');
options.forEach(o => {
  const li = document.createElement('li'), b = document.createElement('button');
  b.innerHTML = `<span class="cur">▶</span><span>${o.label}</span><span class="val"></span>`;
  const val = b.querySelector('.val'); val.textContent = o.get();
  b.addEventListener('click', () => { o.act(); val.textContent = o.get(); b.blur(); play('cursor'); });
  li.appendChild(b); list.appendChild(li);
});
function refreshMenu(){ list.querySelectorAll('li').forEach((li, i) => { const v = li.querySelector('.val'); if (v && options[i]) v.textContent = options[i].get(); }); }
const menu = document.getElementById('menu'), menuHead = document.getElementById('menuHead'), caret = document.getElementById('menuCaret');
function setMenu(open){ menu.classList.toggle('closed', !open); menuHead.setAttribute('aria-expanded', open); caret.textContent = open ? '▾' : '▸'; }
menuHead.addEventListener('click', () => { setMenu(menu.classList.contains('closed')); menuHead.blur(); });
for (const id of ['optBtn', 'optBtn2']) document.getElementById(id).addEventListener('click', ev => { ev.stopPropagation(); refreshMenu(); setMenu(true); play('confirm'); });
setMenu(false);

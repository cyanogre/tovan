'use strict';
/* ======================================================================
   TEMAS DE LA INTERFAZ (Opciones → Interfaz)
     · Clásica   · las ventanas azules de siempre
     · Albarán   · etiquetas de envío, tickets, pósits y sellos de goma
     · Emaki     · tinta, papel washi y sellos bermellón
     · Relámpago · gráfico: diagonales, amarillo, negro y rosa
   Cada tema es un CSS (css/tema-*.css) que solo se aplica con
   <body data-ui="…">. Aquí se elige, se guarda en localStorage
   ('tovan-ui') y se preparan los datos que esos CSS necesitan:
   filtros SVG de tinta, el número de la oleada por separado (y en kanji),
   el kanji de cada pieza de los capitanes y los colores del radar.
   ====================================================================== */
const UI_TEMAS = [['clasica', 'Clásica'], ['albaran', 'Albarán'], ['emaki', 'Emaki'], ['relampago', 'Relámpago']];
const UI_DEF = 'albaran';
let uiTema = UI_DEF;
try { const t = localStorage.getItem('tovan-ui'); if (UI_TEMAS.some(x => x[0] === t)) uiTema = t; } catch (e) {}

/* ---------- Colores del radar por tema (los demás heredan los de la clásica) ---------- */
const UI_RADAR = {
  albaran:   { fondo: 'rgba(244,239,227,.94)', borde: '#1b1915', bordeW: 2, bajo: 'rgba(27,25,21,.28)', alto: 'rgba(27,25,21,.55)', agua: 'rgba(36,72,160,.35)', hielo: 'rgba(36,72,160,.18)',
    pad: '#2448a0', enemigo: '#d43b2a', frente: '#d43b2a', heroe: '#1b1915', cura: '#2d8a3e', cap1: '#d43b2a', cap2: '#1b1915', paquete: '#b8860b', perim: 'rgba(184,134,11,.9)', ladron: '#c2459a', elite: '#b8860b' },
  emaki:     { fondo: 'rgba(16,13,10,.8)', borde: 'rgba(239,230,210,.0)', bordeW: 0, bajo: 'rgba(239,230,210,.22)', alto: 'rgba(239,230,210,.4)', agua: 'rgba(110,160,220,.4)', hielo: 'rgba(200,225,245,.3)',
    pad: '#c4a066', enemigo: '#e0503b', frente: '#e0503b', heroe: '#efe6d2', cura: '#9fd38a', cap1: '#e0503b', cap2: '#c4a066', paquete: '#c4a066', perim: 'rgba(196,160,102,.85)' },
  relampago: { fondo: '#0c0c10', borde: '#ffd21f', bordeW: 4, bajo: 'rgba(255,255,255,.22)', alto: 'rgba(255,255,255,.4)', agua: 'rgba(51,225,244,.35)', hielo: 'rgba(51,225,244,.2)',
    pad: '#33e1f4', enemigo: '#ff3b7f', frente: '#ff3b7f', heroe: '#f8f6f1', heroeBorde: '#0c0c10', cura: '#7dff8a', cap1: '#ffd21f', cap2: '#ff3b7f', paquete: '#ffd21f', perim: 'rgba(255,210,31,.85)' }
};

/* ---------- Filtros SVG (tinta corrida, pincel, mancha) y el ensō ---------- */
{ const d = document.createElement('div'); d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = `<svg width="0" height="0"><defs>
  <filter id="uiSello" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.6 0 0 0 -.75" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
  <filter id="uiPincel" x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".035 .5" numOctaves="3" seed="2" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="6" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4 0 0 0 -.8" result="m"/><feComposite in="d" in2="m" operator="in"/></filter>
  <filter id="uiPincel2" x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".04 .6" numOctaves="3" seed="4" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
  </defs></svg>`;
  document.body.appendChild(d); }

/* ---------- Número de la oleada por separado ---------- */
// waveTxt lo reescribe main.js en cada fotograma ("Oleada 7 · 10 enemigos", "Castillo · Sala 3 · 12"…);
// aquí se copia, troceado, a .uiOla para que cada tema lo pinte a su manera (el clásico lo oculta).
const UI_KAN = '〇一二三四五六七八九';
const uiKanji = n => n <= 0 ? '〇' : n >= 100 ? String(n) : (n >= 20 ? UI_KAN[Math.floor(n / 10)] : '') + (n >= 10 ? '十' : '') + (n % 10 ? UI_KAN[n % 10] : '');
const uiOla = document.createElement('span'); uiOla.className = 'uiOla'; uiOla.setAttribute('aria-hidden', 'true');
uiOla.innerHTML = '<span class="t"></span><span class="k"></span><span class="n"></span><span class="q"><b></b><i></i></span>'; waveBox.appendChild(uiOla);
const [uiOlaT, uiOlaK, uiOlaN, uiOlaQ] = ['.t', '.k', '.n', '.q'].map(s => uiOla.querySelector(s)), uiOlaQb = uiOlaQ.firstChild, uiOlaQi = uiOlaQ.lastChild;
let uiOlaTxt = '';
function uiOlaPinta(){
  const s = waveTxt.textContent; if (s === uiOlaTxt) return; uiOlaTxt = s;
  const p = s.split(' · '), ola = /^Oleada/.test(p[0]), nm = (ola ? p[0] : p[1] || '').match(/\d+/), n = nm ? +nm[0] : 0;
  const resto = (ola ? p.slice(1) : p.slice(2)).join(' · '), cm = resto.match(/^(\d+)(.*)$/);
  uiOlaT.textContent = ola ? 'Oleada' : p[0] + (p[1] ? ' · ' + p[1].replace(/\d+/, '').trim() : '');
  uiOlaN.textContent = n ? String(n).padStart(2, '0') : ''; uiOlaK.textContent = n ? uiKanji(n) : '';
  uiOlaQb.textContent = cm ? cm[1] : resto; uiOlaQi.textContent = cm ? (cm[2].trim() || 'enemigos').replace(/^·\s*/, '') : '';
}
new MutationObserver(uiOlaPinta).observe(waveTxt, { childList: true, characterData: true, subtree: true });
uiOlaPinta();

/* ---------- Kanji de las piezas de los capitanes (sello de cada pieza en Emaki) ---------- */
const UI_PIEZA_K = { 'Kanabō': '棒', 'Cuernos': '角', 'Calabaza': '瓢', 'Escudo': '盾', 'Núcleo': '核', 'Ojo de cristal': '眼' };
new MutationObserver(() => { for (const c of capPartsEl.children){ const n = (c.querySelector('b') || c).textContent.trim(); if (c.dataset.k == null) c.dataset.k = UI_PIEZA_K[n] || n.charAt(0); } })
  .observe(capPartsEl, { childList: true });

/* ---------- Columna izquierda: estado, familias, misión y capitán ---------- */
// En los temas nuevos, en pantallas anchas, la misión y el capitán van bajo el HUD y las familias,
// y el centro queda libre (el rótulo y el combo ya no tienen que apartarse).
const _objColAjustaUI = objColAjusta;
objColAjusta = function(){
  _objColAjustaUI();
  // también en móvil en horizontal (con cualquier tema): ahí no cabe nada en el centro
  const apaisado = innerHeight <= 520 && innerWidth > innerHeight, lado = apaisado || (uiTema !== 'clasica' && innerWidth > 720 && innerHeight > 520);
  objCol.classList.toggle('uiLado', lado); objCol.classList.toggle('uiApaisado', apaisado);
  if (!lado){ tagsEl.style.top = ''; return; }
  const h = hud.hidden ? 12 : hud.getBoundingClientRect().bottom + (apaisado ? 6 : 10);
  tagsEl.style.top = Math.round(h) + 'px';
  const t = apaisado || tagsEl.hidden || !tagsEl.childElementCount ? h : Math.max(h, tagsEl.getBoundingClientRect().bottom + 10);   // en horizontal las familias se tapan con la misión
  objCol.style.top = Math.round(t) + 'px';
  document.body.style.setProperty('--objfin', '0px');
};

/* ---------- Aplicar y elegir ---------- */
function uiAplica(t){
  uiTema = t; document.body.dataset.ui = t;
  for (const k in MP_RCOL) delete MP_RCOL[k];
  Object.assign(MP_RCOL, MP_RCOL_CLASICA, UI_RADAR[t] || {});
  objColT = 0;
  try { localStorage.setItem('tovan-ui', t); } catch (e) {}
}
// La opción va la primera del menú; menu-opciones.js carga más tarde (grupo «Arranque»), así que se añade al terminar la carga
document.addEventListener('DOMContentLoaded', () => {
  options.unshift({ label: 'Interfaz', get: () => UI_TEMAS.find(x => x[0] === uiTema)[1],
    act: () => { const i = UI_TEMAS.findIndex(x => x[0] === uiTema); uiAplica(UI_TEMAS[(i + 1) % UI_TEMAS.length][0]); } });
  const li = document.createElement('li'), b = document.createElement('button');
  b.innerHTML = '<span class="cur">▶</span><span>Interfaz</span><span class="val"></span>';
  const val = b.querySelector('.val'); val.textContent = options[0].get();
  b.addEventListener('click', () => { options[0].act(); val.textContent = options[0].get(); b.blur(); play('cursor'); });
  li.appendChild(b); document.getElementById('menuList').prepend(li);
});
uiAplica(uiTema);

/* ---------- Rótulo de las cartas: que quepa en una línea ----------
   En los temas que lo ponen en una franja de altura fija (white-space: nowrap, como Relámpago), los rótulos
   largos («✦ Especial de rama», «⚔ La chancla de la abuela», «Común ¡Nueva!») se salían o se cortaban:
   se encoge la letra hasta que cabe. Donde el rótulo puede partirse en dos líneas no se toca. */
function rarAjusta(){
  for (const el of cardsEl.querySelectorAll('.card .rar')){
    el.style.removeProperty('font-size');
    if (!el.clientWidth || getComputedStyle(el).whiteSpace !== 'nowrap') continue;
    let fs = parseFloat(getComputedStyle(el).fontSize), n = 0;
    while (el.scrollWidth > el.clientWidth + 1 && fs > 9 && n++ < 12){ fs = Math.max(9, Math.min(fs - 0.5, Math.floor(fs * el.clientWidth / el.scrollWidth * 2) / 2)); el.style.setProperty('font-size', fs + 'px', 'important'); }
  }
}
{ let pend = false; const pide = () => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; rarAjusta(); }); };
  new MutationObserver(pide).observe(cardsEl, { childList: true, subtree: true, characterData: true });
  new MutationObserver(pide).observe(upScr, { attributes: true, attributeFilter: ['hidden', 'class'] });   // (oculto no se puede medir)
  if (document.fonts) document.fonts.addEventListener('loadingdone', pide);   // (con la letra de reserva mide otra cosa)
  addEventListener('resize', pide); const _uiAplicaRar = uiAplica; uiAplica = function(t){ _uiAplicaRar(t); pide(); }; }

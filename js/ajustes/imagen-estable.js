'use strict';
/* ===== Imagen estable: sin texturas que se deforman ni vértices que tiemblan =====
   El look PS1 traía dos efectos que mueven las texturas al mover la cámara: el mapeo afín (sin corrección de
   perspectiva: en los polígonos grandes y cercanos la textura se dobla y «nada», como en el suelo de la intro o la
   esfera y las paredes de la torre del Guardián) y el temblor de vértices (enganchados a la rejilla de 320×240). Al
   usuario no le gustaban: ahora vienen apagados. Se pueden volver a encender en Opciones («Temblor de vértices» y
   «Texturas afines»).
   Todas las opciones de imagen se guardan en localStorage tovan-ps1: esas dos, la resolución, el color de 15 bits y
   las líneas CRT (las tres últimas se olvidaban al volver a abrir el juego). Cada opción guarda solo lo suyo. La playa
   del mundo real y el Canal X cambian algunas por su cuenta y las devuelven al salir (realPrev, chFx): si se tocan
   allí, lo que devuelven es lo elegido. */
const IMG_PS1 = (() => { const d = { snap: 0, afin: 0 }; try { return Object.assign(d, JSON.parse(localStorage.getItem('tovan-ps1') || '{}')); } catch (err) { return d; } })();
shared.uSnap.value = IMG_PS1.snap ? 1 : 0; shared.uAffine.value = IMG_PS1.afin ? 1 : 0;
if (IMG_PS1.color != null) shared.uDither.value = IMG_PS1.color ? 1 : 0;
// opción → [campo guardado, valor actual, posición en realPrev (playa) y chFx (Canal X, solo las tres primeras)]
const IMG_OPC = {
  'Temblor de vértices': ['snap', () => shared.uSnap.value, 0], 'Texturas afines': ['afin', () => shared.uAffine.value, 1],
  'Color 15 bits': ['color', () => shared.uDither.value, 2], 'Resolución': ['res', () => resIdx, 3], 'Líneas CRT': ['crt', () => scanOn ? 1 : 0, -1]
};
function imgGuarda(){ try { localStorage.setItem('tovan-ps1', JSON.stringify(IMG_PS1)); } catch (err) {} }
document.addEventListener('DOMContentLoaded', () => {   // (resolucion.js y menu-opciones.js van en «Arranque»)
  if (RES[IMG_PS1.res]){ resIdx = IMG_PS1.res; resize(); }
  if (IMG_PS1.crt === 0){ scanOn = false; scanEl.style.display = 'none'; }
  for (const o of options){ const k = IMG_OPC[o.label]; if (!k) continue; const act = o.act;
    o.act = function(){ const r = act.apply(this, arguments), v = k[1](); IMG_PS1[k[0]] = v;
      if (k[2] >= 0 && realOn && realPrev) realPrev[k[2]] = v; if (k[2] >= 0 && k[2] < 3 && chFx) chFx[k[2]] = v;
      imgGuarda(); return r; }; }
  refreshMenu();
});

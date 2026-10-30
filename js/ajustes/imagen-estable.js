'use strict';
/* ===== Imagen estable: sin texturas que se deforman ni vértices que tiemblan =====
   El look PS1 traía dos efectos que mueven las texturas al mover la cámara: el mapeo afín (sin corrección de
   perspectiva: en los polígonos grandes y cercanos la textura se dobla y «nada», como en el suelo de la intro o la
   esfera y las paredes de la torre del Guardián) y el temblor de vértices (enganchados a la rejilla de 320×240). Al
   usuario no le gustaban: ahora vienen apagados. Se pueden volver a encender en Opciones («Temblor de vértices» y
   «Texturas afines»); la elección se guarda en localStorage tovan-ps1. La playa del mundo real y el Canal X los apagan
   y devuelven por su cuenta, así que siguen funcionando igual. */
const IMG_PS1 = (() => { try { return Object.assign({ snap: 0, afin: 0 }, JSON.parse(localStorage.getItem('tovan-ps1') || '{}')); } catch (err) { return { snap: 0, afin: 0 }; } })();
shared.uSnap.value = IMG_PS1.snap ? 1 : 0; shared.uAffine.value = IMG_PS1.afin ? 1 : 0;
function imgGuarda(){ try { localStorage.setItem('tovan-ps1', JSON.stringify({ snap: shared.uSnap.value, afin: shared.uAffine.value })); } catch (err) {} }
document.addEventListener('DOMContentLoaded', () => {   // (las opciones están en menu-opciones.js, en «Arranque»)
  for (const o of options) if (o.label === 'Temblor de vértices' || o.label === 'Texturas afines'){ const act = o.act; o.act = function(){ const r = act.apply(this, arguments); imgGuarda(); return r; }; }
});

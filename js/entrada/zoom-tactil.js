'use strict';
/* ---------- Zoom con dos dedos (móvil) ---------- */
// Pellizcar en la pantalla acerca o aleja la cámara, como la rueda del ratón (camDist, de 4 a 10 m).
// Mientras hay dos dedos, el arrastre no gira la cámara: el movimiento se corta aquí, en la fase de captura,
// antes de llegar a los manejadores de controles.js (que se registran después, en «Arranque»).
const pellizco = { ptrs: new Map(), d0: 0, cam0: 7 };
const pellizcoDist = () => { const [a, b] = [...pellizco.ptrs.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
const pellizcoBase = () => { if (pellizco.ptrs.size === 2){ pellizco.d0 = pellizcoDist(); pellizco.cam0 = camDist; } };
canvas.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch') return; pellizco.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); pellizcoBase(); }, true);
canvas.addEventListener('pointermove', e => {
  const p = pellizco.ptrs.get(e.pointerId); if (!p) return; p.x = e.clientX; p.y = e.clientY;
  if (pellizco.ptrs.size < 2) return;
  e.stopImmediatePropagation();
  const d = pellizcoDist(); if (pellizco.d0 > 20 && d > 20) camDist = clamp(pellizco.cam0 * pellizco.d0 / d, 4, 10);
}, true);
const pellizcoFin = e => { pellizco.ptrs.delete(e.pointerId); pellizcoBase(); };
canvas.addEventListener('pointerup', pellizcoFin, true); canvas.addEventListener('pointercancel', pellizcoFin, true);

'use strict';
/* ======================================================================
   JUEGO 3 · MARCIANITOS (el minijuego 3D de siempre, con él dentro)
   ====================================================================== */
const INV9G = { overlay: false, song: null, title: ['PROGRAMA 3', '¡Marcianitos!', 'Muévete de lado y dispara · Él también está dentro'], ep: 'ep-invaders',
  start(){ setChannel('invaders'); MG.invT = 0; },
  btn(){}, upd(dt){ if (inv.over){ MG.invT += dt; if (MG.invT > 1.4){ MG.invT = 0; startInvaders(); } } },
  finish(){ MG.endT = 1.4; big9('', '', 0.1); banner('¡Nave nodriza derribada!<small>Último programa: ¡la fantasía final!</small>', 1.6); play('specialBoom'); },
  draw(){}, end(){ if (chMode === 'invaders') setChannel('anime'); } };

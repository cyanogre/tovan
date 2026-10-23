'use strict';
/* ======================================================================
   SIN CARTELES: en partida no sale texto que no haga falta para jugar.
   Fuera: los banners del centro mientras se juega (oleada, «¡Oleada
   superada!», ataques de jefes, desbloqueos…: la oleada, el encargo y la
   vida del jefe ya están en el HUD), las palabras flotantes (`react`:
   «¡Hop!», «¡Crítico!», frases de los enemigos, nombres de técnicas) y
   el nombre del poder al cogerlo (#pop7). Los rótulos de los foil, la
   palabra del combo y los nombres de las técnicas de TOVAN.EXE se quitan
   en css/sin-carteles.css. Se quedan, en pequeño, los avisos que piden
   algo (agarrarse, saltar la onda). Fuera de la partida (cartas, menús,
   cinemáticas) los banners siguen saliendo.
   ====================================================================== */
const _bannerSC = banner;
banner = function(html, dur){ if (gameState === 'play') return; return _bannerSC(html, dur); };
const _spawnNumberSC = spawnNumber;
spawnNumber = function(pos, text, cls, color){ if (cls === 'react') return; return _spawnNumberSC(pos, text, cls, color); };

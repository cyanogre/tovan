'use strict';
/* ======================================================================
   ROGUELIKE POR OLEADAS
   ====================================================================== */
const V3 = THREE.Vector3, TAU = Math.PI * 2;
let ARENA = 6.3;   // radio del mapa jugable: js/mundo/mapas-grandes.js lo agranda en las oleadas normales de los tres primeros escenarios
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerpAngle = (a, b, t) => { const d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI; return a + d * t; };
const angTo = (ax, az, bx, bz) => Math.atan2(bx - ax, bz - az);
const tA = new V3(), tB = new V3(), pr = new V3();

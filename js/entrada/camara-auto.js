'use strict';
/* ======================================================================
   CÁMARA AUTOMÁTICA (Opciones → Cámara: Automática | Manual;
   localStorage 'tovan-cam'). Al correr de lado, la cámara se va poniendo
   poco a poco detrás de Tovan, como en los juegos de ahora. Es suave a
   propósito: si corres hacia la cámara no se da la vuelta (se le sigue
   viendo la cara) y, si la mueves tú (ratón, dedo o palanca derecha del
   mando), se queda quieta un rato. No toca los planos semifijos:
   cinemáticas, Canal X, marcianitos, el show, el Ryūjin colosal,
   TOVAN.EXE, el Gashadokuro y las técnicas con cámara propia.
   ====================================================================== */
const CAMA = { on: true, pausa: 0, anda: 0 };
try { CAMA.on = localStorage.getItem('tovan-cam') !== 'manual'; } catch (e) {}
function camAutoAplica(on){ CAMA.on = on; try { localStorage.setItem('tovan-cam', on ? 'auto' : 'manual'); } catch (e) {} }
function camAutoPuede(){
  return CAMA.on && gameState === 'play' && !player.dead && !cs.active && !lcut && !chActive && !invActive && state !== 'tech' && !MG.active
    && !COL.montado && !SH3.montado && !TER.montado && !(bossE && bossE.type === 'skeleton' && bossE.alive);
}
function camPadGira(){ try { const ps = navigator.getGamepads ? navigator.getGamepads() : null; if (ps) for (const p of ps) if (p && p.connected) return Math.abs(p.axes[2] || 0) > 0.2; } catch (e) {} return false; }
function camAutoTick(pdt){
  if (dragging || camPadGira()) CAMA.pausa = 2.2; else if (CAMA.pausa > 0) CAMA.pausa -= pdt;
  const mueve = inputMag > 0.3 && (state === 'normal' || state === 'charge');
  CAMA.anda = mueve ? CAMA.anda + pdt : 0;
  if (!camAutoPuede() || CAMA.pausa > 0 || CAMA.anda < 0.35 || pdt <= 0) return;
  const dif = Math.atan2(Math.sin(inputHeading + Math.PI - camYaw), Math.cos(inputHeading + Math.PI - camYaw)), a = Math.abs(dif);   // 0 = ya está detrás; π = viene hacia la cámara
  const lado = Math.sin(a), hacia = a > Math.PI / 2 ? Math.max(0, 1 - (a - Math.PI / 2) / (Math.PI * 0.4)) : 1;
  const d = dif * (1 - Math.exp(-pdt * 0.35 * lado * hacia * Math.min(1, inputMag)));
  camYaw += d; if (typeof tuto !== 'undefined' && tuto.on) tuto.yaw += d;   // (el paso «gira la cámara» del tutorial solo cuenta lo que gira el jugador)
}
const _v3UpdateCam = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateCam(dt, pdt, playing); try { camAutoTick(pdt); } catch (err) { console.error(err); } };
document.addEventListener('DOMContentLoaded', () => {
  const o = { label: 'Cámara', get: () => CAMA.on ? 'Automática' : 'Manual', act: () => camAutoAplica(!CAMA.on) };
  const i = options.findIndex(q => q.label === 'HUD') + 1 || options.length;
  options.splice(i, 0, o);   // tras «HUD»
  const li = document.createElement('li'), b = document.createElement('button');
  b.innerHTML = '<span class="cur">▶</span><span>Cámara</span><span class="val"></span>';
  const val = b.querySelector('.val'); val.textContent = o.get();
  b.addEventListener('click', () => { o.act(); val.textContent = o.get(); b.blur(); play('cursor'); });
  li.appendChild(b); const l = document.getElementById('menuList'); l.insertBefore(li, l.children[i] || null);
});

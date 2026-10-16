'use strict';
/* ======================================================================
   PANTALLA COMPLETA EN MÓVIL
   Los navegadores solo dejan entrar en pantalla completa tras un toque, así
   que en pantallas táctiles se pide en el primer toque (y en cada toque si
   se salió sin quererlo). Se puede desactivar en Opciones → Pantalla completa
   ('tovan-fs' en localStorage). En iPhone, Safari no lo permite: ahí sirve
   «Añadir a pantalla de inicio» (manifest.webmanifest y las metas de Apple).
   ====================================================================== */
const FS_OK = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
const fsTactil = matchMedia('(pointer:coarse)').matches;
let fsOn = fsTactil;
try { const v = localStorage.getItem('tovan-fs'); if (v != null) fsOn = v === '1'; } catch (e) {}
const fsDentro = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
function fsEntra(){
  if (!FS_OK || fsDentro()) return;
  const el = document.documentElement, f = el.requestFullscreen || el.webkitRequestFullscreen;
  try { const p = f.call(el, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); } catch (e) {}
}
function fsSale(){ if (!fsDentro()) return; const f = document.exitFullscreen || document.webkitExitFullscreen; try { const p = f.call(document); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
// en el primer toque (y en los siguientes, si se salió con el gesto de atrás)
document.addEventListener('pointerup', ev => { if (fsOn && ev.pointerType === 'touch') fsEntra(); }, true);
document.addEventListener('DOMContentLoaded', () => {
  if (!FS_OK) return;
  const o = { label: 'Pantalla completa', get: () => yn(fsOn),
    act: () => { fsOn = !fsOn; try { localStorage.setItem('tovan-fs', fsOn ? '1' : '0'); } catch (e) {} if (fsOn) fsEntra(); else fsSale(); } };
  options.splice(1, 0, o);   // tras «Interfaz»
  const li = document.createElement('li'), b = document.createElement('button');
  b.innerHTML = '<span class="cur">▶</span><span>Pantalla completa</span><span class="val"></span>';
  const val = b.querySelector('.val'); val.textContent = o.get();
  b.addEventListener('click', () => { o.act(); val.textContent = o.get(); b.blur(); play('cursor'); });
  li.appendChild(b); const l = document.getElementById('menuList'); l.insertBefore(li, l.children[1] || null);
});

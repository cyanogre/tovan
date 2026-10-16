'use strict';
/* ======================================================================
   HUD LIMPIO (Opciones → HUD: Limpio | Completo; localStorage 'tovan-hud')
   Mientras se juega, en pantalla solo queda lo que hace falta mirar:
     · Estado: retrato, vida e ímpetu (sin nombre, título ni fragmentos)
     · Oleada, radar, rótulos y combo, más pequeños; el menú de opciones, solo fuera de la partida (en la pausa sigue)
     · Familias: no salen en la partida (están en la pausa y en las cartas)
     · Misión: una sola línea
     · Capitán: su vida y sus piezas flotan sobre él (#capTag), sin panel
     · Lumen hace menos chistes (los avisos de juego y la historia, sí)
   El CSS está en css/hud-limpio.css (body.hudmin).
   Aparte, y con cualquier HUD: en el móvil en vertical la cámara se abre (antes se veían unos 3 m de lado a lado).
   ====================================================================== */
let hudLimpio = true;
try { hudLimpio = localStorage.getItem('tovan-hud') !== 'completo'; } catch (e) {}
function hudAplica(on){
  hudLimpio = on; document.body.classList.toggle('hudmin', on); objColT = 0;
  try { localStorage.setItem('tovan-hud', on ? 'limpio' : 'completo'); } catch (e) {}
}
hudAplica(hudLimpio);
document.addEventListener('DOMContentLoaded', () => {
  const o = { label: 'HUD', get: () => hudLimpio ? 'Limpio' : 'Completo', act: () => hudAplica(!hudLimpio) };
  options.splice(1, 0, o);   // tras «Interfaz»
  const li = document.createElement('li'), b = document.createElement('button');
  b.innerHTML = '<span class="cur">▶</span><span>HUD</span><span class="val"></span>';
  const val = b.querySelector('.val'); val.textContent = o.get();
  b.addEventListener('click', () => { o.act(); val.textContent = o.get(); b.blur(); play('cursor'); });
  li.appendChild(b); const l = document.getElementById('menuList'); l.insertBefore(li, l.children[1] || null);
});

/* ---------- Lumen: menos chistes ---------- */
// Los chistes de comedia-v10 (inicio de oleada, poca vida, quieto, cartas repetidas) salían cada 14 s como mucho; con el HUD limpio, cada 40.
let hudChisteT = -99;
const _comedy10Hud = comedy10;
comedy10 = function(q){
  if (hudLimpio && time - hudChisteT < 40) return false;
  const r = _comedy10Hud(q); if (r) hudChisteT = time; return r;
};

/* ---------- El capitán: el rótulo del capitán va sin cartel ---------- */
// Con el HUD limpio, el «¡Capitán a la vista!» lo hace la etiqueta que aparece sobre él (y Lumen, que explica las piezas).
const _spawnCaptainHud = spawnCaptain;
spawnCaptain = function(kind){
  if (!hudLimpio) return _spawnCaptainHud(kind);
  const b = banner; banner = () => {};
  try { return _spawnCaptainHud(kind); } finally { banner = b; }
};

/* ---------- Etiqueta del capitán (vida y piezas sobre su cabeza) ---------- */
const capTag = document.createElement('div'); capTag.id = 'capTag'; capTag.hidden = true; capTag.setAttribute('aria-hidden', 'true');
capTag.innerHTML = '<div class="ctn"><em>Capitán</em><b></b><span></span></div><div class="ctb"><i></i></div><div class="ctp"></div>';
document.body.appendChild(capTag);
const capTagN = capTag.querySelector('.ctn b'), capTagI = capTag.querySelector('.ctn span'), capTagB = capTag.querySelector('.ctb i'), capTagP = capTag.querySelector('.ctp');
const CT_ZONA = { frente: 'de frente', espalda: 'por detrás', aire: 'saltando' };
let capTagE = null, capTagKey = '', capTagTop = 100, capTagTopT = 0;
const _ctV = new V3();
function capTagTick(playing){
  const e = hudLimpio && (playing || gameState === 'paused') && !document.body.classList.contains('cine') ? enemies.find(q => q.cap && q.alive) : null;
  if (!e || e.spawnT > 0){ if (!capTag.hidden) capTag.hidden = true; if (!e) capTagE = null; return; }
  const c = e.cap; if (!c.init) capInit(e);
  if (e !== capTagE){ capTagE = e; capTagKey = ''; capTag.classList.remove('pop'); void capTag.offsetWidth; capTag.classList.add('pop'); }
  capTagB.style.width = Math.max(0, e.hp / e.maxHp * 100) + '%';
  const key = c.name + '|' + c.info + '|' + c.parts.map(p => p.broken ? 'x' : Math.ceil(p.hp / p.max * 20)).join(',');
  if (key !== capTagKey){
    capTagKey = key; capTagN.textContent = c.name; capTagI.textContent = c.info || '';
    capTagP.innerHTML = c.parts.map(p => `<span class="${p.broken ? 'roto' : 'z-' + p.zone}"><b>${p.name}</b><i><u style="width:${p.broken ? 0 : Math.max(0, p.hp / p.max * 100)}%"></u></i><em>${p.broken ? 'rota' : CT_ZONA[p.zone] || p.zone}</em></span>`).join('');
  }
  // sobre la cabeza; si se sale de la pantalla, se queda pegada al borde
  _ctV.set(e.g.position.x, e.g.position.y + (e.numY || 2.4) + 0.3, e.g.position.z).project(camera);
  const detras = _ctV.z > 1, W = innerWidth, H = innerHeight, w = capTag.offsetWidth || 180, h = capTag.offsetHeight || 60;
  let x = (_ctV.x * 0.5 + 0.5) * W, y = (-_ctV.y * 0.5 + 0.5) * H;
  if (detras){ x = W - x; y = H; }
  const top = capTagTop + h, bot = H - (matchMedia('(pointer:coarse)').matches ? 190 : 24);
  let cx = clamp(x, w / 2 + 8, W - w / 2 - 8), cy = clamp(y, top, bot);
  const fuera = detras || cx !== x || cy !== y;
  const lado = fuera && (detras || Math.abs(x - W / 2) > W * 0.25);
  if (fuera){ cy = clamp(y, top, Math.max(top, H * 0.58)); if (lado) cx = x < W / 2 ? w / 2 + 8 : W - w / 2 - 8; }   // fuera de cámara: pequeña y en el borde (con flecha si es de lado)
  capTag.classList.toggle('fuera', fuera); capTag.classList.toggle('izq', lado && cx < W / 2); capTag.classList.toggle('der', lado && cx >= W / 2);
  capTag.style.transform = `translate(${Math.round(cx)}px,${Math.round(cy)}px) translate(-50%,-100%)`;
  capTag.hidden = false;
}

/* ---------- Cámara del móvil en vertical ---------- */
// La cámara tiene 46° de campo vertical; en un móvil en vertical eso eran unos 22° en horizontal. Al jugar, se abre
// hasta tener ~44° de lado a lado (como mucho 78° en vertical). En el título y en las escenas sigue como siempre.
const HUD_FOV0 = camera.fov;
function hudFov(dt){
  const asp = innerWidth / innerHeight, juego = (gameState === 'play' || gameState === 'paused' || gameState === 'upgrade') && !cs.active;
  const obj = asp < 1 && juego ? Math.min(78, Math.max(HUD_FOV0, 2 * Math.atan(Math.tan(22 * Math.PI / 180) / asp) * 180 / Math.PI)) : HUD_FOV0;
  if (Math.abs(camera.fov - obj) < 0.05){ if (camera.fov !== obj){ camera.fov = obj; camera.updateProjectionMatrix(); } return; }
  camera.fov += (obj - camera.fov) * (1 - Math.exp(-dt * 6)); camera.updateProjectionMatrix();
}

const _v3UpdateHud = v3Update;
v3Update = function(dt, pdt, playing){
  _v3UpdateHud(dt, pdt, playing);
  try { capTagTick(playing); hudFov(dt); document.body.classList.toggle('menuVer', gameState === 'title' || gameState === 'paused' || gameState === 'over'); } catch (err) { console.error(err); }
};
